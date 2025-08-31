import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input, from, to, options } = await request.json();

    // Here you would use the actual pandoc-wasm conversion
    // For demo purposes, we'll simulate the conversion
    
    let output = '';
    
    if (from === 'markdown' && to === 'html') {
      output = `<!DOCTYPE html>
<html>
<head>
  <title>Converted Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { color: #2563eb; }
    blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
    code { background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
  </style>
</head>
<body>
${input.replace(/^# (.+)$/gm, '<h1>$1</h1>')
       .replace(/^## (.+)$/gm, '<h2>$1</h2>')
       .replace(/^### (.+)$/gm, '<h3>$1</h3>')
       .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
       .replace(/\*(.+?)\*/g, '<em>$1</em>')
       .replace(/`(.+?)`/g, '<code>$1</code>')
       .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
       .replace(/^- (.+)$/gm, '<li>$1</li>')
       .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
       .replace(/\n\n/g, '</p><p>')
       .replace(/^(?!<[h|l|b|u])(.+)$/gm, '<p>$1</p>')
       .replace(/<p><\/p>/g, '')}
</body>
</html>`;
    } else if (from === 'html' && to === 'markdown') {
      output = input
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<[^>]*>/g, '')
        .trim();
    } else {
      output = `Converted from ${from} to ${to}:\n\n${input}`;
    }

    return NextResponse.json({
      success: true,
      output,
      from,
      to
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Conversion failed' 
      },
      { status: 500 }
    );
  }
}