import fitz

pdf = fitz.open("/Users/apple/Documents/sk23mcqs/books/SK23 Complete PDF -Medicalstudyzone.com-.pdf")

print("Pages:", len(pdf))

page = pdf[2]

pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

pix.save("page1.png")

print("First page exported")