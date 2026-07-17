import pytesseract
from PIL import Image

image = Image.open("temp_page_12.png")

text = pytesseract.image_to_string(image)

print(text[:5000])