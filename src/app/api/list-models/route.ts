import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = 'AIzaSyDPV2JyOzDVWZtuX5FL7U-z_dSKaGA0RaE';
    const baseUrl = 'https://generativelanguage.googleapis.com/v1/models';

    const response = await fetch(`${baseUrl}?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      models: responseText,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}