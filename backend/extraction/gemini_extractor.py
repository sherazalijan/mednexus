from google import genai
from PIL import Image
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_mcqs(image_path):

    image = Image.open(image_path)

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[
            image,
            """
Extract ALL MCQs from this page.

IMPORTANT:

1. Detect the chapter name on the page.
2. If the page belongs to a chapter, include the chapter name.
3. If no chapter name appears, use the previous chapter name.
4. Ignore page numbers, headers, footers, watermarks.
5. Ignore non-MCQ content.

Return ONLY valid JSON.

{
  "chapter_name": "Physiology",

  "mcqs": [
    {
      "question_number": 1,
      "question": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A",
      "explanation": "..."
    }
  ]
}

If no MCQs exist:

{
  "chapter_name": null,
  "mcqs": []
}

Return JSON only.
No markdown.
No code blocks.
No explanation.
"""
        ]
    )

    return response.text