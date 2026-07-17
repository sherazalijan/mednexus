import sys
import os
import json
import fitz
import traceback

sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

from app.models.chapter_service import get_or_create_chapter
from extraction.gemini_extractor import extract_mcqs
from extraction.db_importer import save_mcqs_to_db


PDF_PATH = "/Users/apple/Documents/sk23mcqs/books/SK23 Complete PDF -Medicalstudyzone.com-.pdf"

pdf = fitz.open(PDF_PATH)

print(f"Total Pages: {len(pdf)}")

current_chapter = "General"

# CHANGE THIS WHEN RESUMING
START_PAGE = 154

for page_num in range(START_PAGE, len(pdf)):

    image_file = None

    try:

        print(f"\n{'=' * 50}")
        print(f"Processing Page {page_num + 1}")
        print(f"{'=' * 50}")

        page = pdf[page_num]

        image_file = f"temp_page_{page_num + 1}.png"

        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )

        pix.save(image_file)

        print("Image generated")

        json_output = extract_mcqs(image_file)

        if not json_output:

            print("Empty Gemini response")

            if os.path.exists(image_file):
                os.remove(image_file)

            continue

        start = json_output.find("{")
        end = json_output.rfind("}") + 1

        if start == -1 or end == 0:

            print("No JSON found")

            if os.path.exists(image_file):
                os.remove(image_file)

            continue

        json_output = json_output[start:end]

        data = json.loads(json_output)

        chapter_name = data.get("chapter_name")

        if chapter_name:
            current_chapter = chapter_name

        mcqs = data.get("mcqs", [])

        if not mcqs:

            print("No MCQs found")

            if os.path.exists(image_file):
                os.remove(image_file)

            continue

        print(
            f"Found {len(mcqs)} MCQs | Chapter: {current_chapter}"
        )

        chapter_id = get_or_create_chapter(
            book_id=1,
            chapter_name=current_chapter
        )

        print(f"Chapter ID: {chapter_id}")

        save_mcqs_to_db(
            mcqs=mcqs,
            chapter_id=chapter_id,
            page_number=page_num + 1
        )

        print("Database save completed")

        with open("progress.txt", "w") as f:
            f.write(str(page_num + 1))

        print(
            f"Progress updated -> {page_num + 1}"
        )

        if os.path.exists(image_file):
            os.remove(image_file)

        print(
            f"Page {page_num + 1} completed successfully"
        )

    except Exception:

        print(f"\nERROR PAGE {page_num + 1}")

        traceback.print_exc()

        if image_file and os.path.exists(image_file):
            os.remove(image_file)

        continue

print("\nBOOK PROCESSING COMPLETE")