exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { rant } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.Anthropic_Consule_DLUX,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a haiku master specializing in corporate rage and citizen engineer rebellion. 
        
Someone has submitted this workplace rant: "${rant}"

Write ONE haiku (5-7-5 syllables) that captures their pain with dark humor and wit.

Then on a new line write ONLY one of these exact tone words based on the haiku mood:
RAGE, EXHAUSTED, OVERWHELMED, REBELLIOUS, DEFEATED, VICTORIOUS, ABSURD, ENERGIZED

Format your response exactly like this:
[haiku line 1]
[haiku line 2]
[haiku line 3]
TONE: [tone word]`
      }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;
  
  const lines = text.trim().split('\n');
  const toneLine = lines.find(l => l.startsWith('TONE:'));
  const tone = toneLine ? toneLine.replace('TONE:', '').trim() : 'ABSURD';
  const haikuLines = lines.filter(l => !l.startsWith('TONE:') && l.trim() !== '');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      haiku: haikuLines.slice(0, 3),
      tone: tone
    })
  };
};