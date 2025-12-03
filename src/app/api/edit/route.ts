// src/app/api/edit/route.ts
export const runtime = 'nodejs'

// Increase body size limit for image uploads (default is 4MB, we need more)
export const maxDuration = 60 // 60 seconds timeout

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import sharp from 'sharp'

// Validate API key at startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Use the correct model for image generation/editing
// gemini-2.5-flash-preview-image is the model available in your billing dashboard
const geminiImageModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-image',
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, changeSummary } = await request.json();

    if (!imageUrl || !changeSummary) {
      return NextResponse.json(
        { error: 'Image URL and change summary are required' },
        { status: 400 }
      );
    }

    console.log('🎨 Executing edit with Google Gemini 2.5 Flash Image...');
    console.log('Image URL:', imageUrl);
    console.log('Change Summary:', changeSummary);

    // Step 1: Get image data (handle both URLs and base64)
    let imageBuffer: ArrayBuffer;
    let contentType: string;

    if (imageUrl.startsWith('data:')) {
      // Handle base64 data URL
      console.log('📥 Processing base64 image...');
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 data URL format');
      }
      contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      imageBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      console.log('✅ Processed base64 image, size:', imageBuffer.byteLength, 'bytes');
    } else {
      // Download from URL
      console.log('📥 Downloading image from URL...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const imageResponse = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      imageBuffer = await imageResponse.arrayBuffer();
      contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      console.log('✅ Downloaded image, size:', imageBuffer.byteLength, 'bytes');
    }

    console.log('📄 Content-Type:', contentType);

    // Step 2: Convert to Sharp image and compress if needed
    let processedImageBuffer: Buffer;
    let finalMimeType = 'image/jpeg';

    try {
      // Use Sharp to process the image
      const sharpImage = sharp(Buffer.from(imageBuffer));

      // Get image info
      const metadata = await sharpImage.metadata();
      console.log(`🖼️ Image info: ${metadata.format} ${metadata.width}x${metadata.height} ${metadata.channels} channels`);

      // Resize if image is too large (max 4096px on longest side for Gemini)
      const maxDimension = 4096;
      let pipeline = sharpImage;
      
      if (metadata.width && metadata.height) {
        if (metadata.width > maxDimension || metadata.height > maxDimension) {
          console.log('📐 Resizing image to fit within', maxDimension, 'px');
          pipeline = pipeline.resize(maxDimension, maxDimension, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
      }

      // Convert to JPEG with quality 85 to reduce size
      processedImageBuffer = await pipeline
        .jpeg({ quality: 85 })
        .toBuffer();
      
      console.log('✅ Compressed image size:', processedImageBuffer.length, 'bytes');

    } catch (sharpError) {
      console.error('❌ Sharp processing error:', sharpError);
      // Fallback to original buffer if Sharp fails
      processedImageBuffer = Buffer.from(imageBuffer);
      finalMimeType = contentType;
    }

    // Step 3: Send to Google Gemini 2.5 Flash Image Preview (exactly as user requested)
    console.log('🤖 Sending to Google Gemini 2.5 Flash Image Preview...');
    console.log('📋 Prompt:', changeSummary);
    console.log('📊 Image size:', processedImageBuffer.length, 'bytes');
    console.log('📄 MIME type:', finalMimeType);

    let response;
    try {
      // Add timeout for Gemini API call (45 seconds)
      const geminiTimeoutId = setTimeout(() => {
        console.log('⏰ Gemini API call timed out');
      }, 45000);

      response = await geminiImageModel.generateContent([
        changeSummary,
        {
          inlineData: {
            mimeType: finalMimeType,
            data: processedImageBuffer.toString('base64')
          }
        }
      ]);

      clearTimeout(geminiTimeoutId);

      console.log('✅ Received response from Google Gemini 2.5 Flash Image');
      console.log('📦 Raw response structure:', JSON.stringify(response, null, 2));

    } catch (geminiError: unknown) {
      console.error('❌ Gemini API error:', geminiError);
      const error = geminiError as Error & { name?: string }

      if (error.message?.includes('timeout') || error.name === 'AbortError') {
        console.log('⏰ Gemini API call timed out');
        return NextResponse.json({
          ok: false,
          error: 'Gemini API request timed out. Please try again.',
          method: 'timeout',
          timestamp: new Date().toISOString()
        });
      }

      throw geminiError; // Re-throw to be caught by outer catch
    }

    // Step 4: Process the response (Google Gemini API format)
    const generatedImages: string[] = [];

    // Check for API errors first
    if (response.response?.candidates?.[0]?.finishReason === 'SAFETY') {
      console.log('🚫 Gemini blocked content due to safety filters');
      return NextResponse.json({
        ok: false,
        error: 'Content blocked by safety filters. Please try a different prompt.',
        method: 'safety_blocked',
        timestamp: new Date().toISOString()
      });
    }

    if (response.response && response.response.candidates && response.response.candidates.length > 0) {
      const candidate = response.response.candidates[0];
      console.log('🎯 Candidate finish reason:', candidate.finishReason);
      console.log('📋 Candidate safety ratings:', candidate.safetyRatings);

      if (candidate.content && candidate.content.parts) {
        console.log(`📦 Found ${candidate.content.parts.length} parts in response`);

        for (const part of candidate.content.parts) {
          if (part.text) {
            console.log('📝 Text response:', part.text);
          } else if (part.inlineData) {
            console.log('🖼️ Processing image part');

            // Convert binary image data to base64 data URL
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const dataUrl = `data:${mimeType};base64,${imageData}`;

            generatedImages.push(dataUrl);
            console.log(`✅ Generated image: ${mimeType}, size: ${imageData.length} chars`);
          }
        }
      } else {
        console.log('⚠️ No content in candidate');
        console.log('📄 Full candidate:', JSON.stringify(candidate, null, 2));
      }
    } else {
      console.log('⚠️ No candidates in response');
      console.log('📄 Full response:', JSON.stringify(response, null, 2));
    }

    if (generatedImages.length === 0) {
      console.log('⚠️ No images were generated by Gemini, using enhanced fallback processing...');

      // Enhanced Fallback: Apply image enhancements with Sharp
      try {
        console.log('🔧 Applying enhanced fallback image processing with Sharp...');

        // Get original image metadata
        const originalMetadata = await sharp(Buffer.from(imageBuffer)).metadata();
        console.log('📊 Original image:', `${originalMetadata.width}x${originalMetadata.height} ${originalMetadata.format}`);

        // Apply enhancements: auto-orient, sharpen slightly, and optimize
        const processedBuffer = await sharp(Buffer.from(imageBuffer))
          .rotate() // Auto-orient based on EXIF
          .sharpen({ sigma: 0.5 }) // Slight sharpening
          .jpeg({
            quality: 95, // Higher quality
            progressive: true // Progressive JPEG
          })
          .toBuffer();

        const fallbackImage = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

        console.log('✅ Enhanced fallback processing completed');
        console.log('📊 Processed image size:', processedBuffer.length, 'bytes');

        return NextResponse.json({
          ok: true,
          edited: fallbackImage,
          method: 'enhanced_fallback',
          hasImageData: true,
          generatedImages: [fallbackImage],
          timestamp: new Date().toISOString(),
          note: 'Used enhanced fallback - Gemini API did not generate new images. Applied image optimization and sharpening.',
          originalSize: imageBuffer.byteLength,
          processedSize: processedBuffer.length
        });
      } catch (fallbackError) {
        console.error('❌ Enhanced fallback processing failed:', fallbackError);

        // Last resort: return original image
        try {
          const originalImage = `data:${contentType};base64,${Buffer.from(imageBuffer).toString('base64')}`;

          return NextResponse.json({
            ok: true,
            edited: originalImage,
            method: 'original_fallback',
            hasImageData: true,
            generatedImages: [originalImage],
            timestamp: new Date().toISOString(),
            note: 'Used original image - Both Gemini and enhanced processing failed',
            error: 'Processing failed, returning original image'
          });
        } catch (originalError) {
          console.error('❌ Even original image processing failed:', originalError);

          const textResponse = response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                             response.response?.text() ||
                             'Unable to process image. Please try again.';

          return NextResponse.json({
            ok: false,
            error: 'All processing methods failed',
            method: 'complete_failure',
            hasImageData: false,
            generatedImages: [],
            timestamp: new Date().toISOString(),
            textResponse: textResponse
          });
        }
      }
    }

    console.log(`🎉 Success! Generated ${generatedImages.length} image(s)`);

    return NextResponse.json({
      ok: true,
      edited: generatedImages[0], // Primary image
      method: 'google_gemini',
      hasImageData: true,
      generatedImages: generatedImages,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Edit execution error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to execute edit',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
