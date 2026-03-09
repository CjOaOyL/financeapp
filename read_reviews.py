import PyPDF2, os, glob

folder = r'C:\Users\jaqua\Downloads\JKL_Resumes\JKL_Resumes\Reviews'
pdfs = sorted(glob.glob(os.path.join(folder, '*.pdf')))
sep = '=' * 80

for pdf_path in pdfs:
    fname = os.path.basename(pdf_path)
    print(f'\n{sep}')
    print(f'FILE: {fname}')
    print(sep)
    try:
        reader = PyPDF2.PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                print(f'--- Page {i+1} ---')
                print(text)
    except Exception as e:
        print(f'ERROR reading {fname}: {e}')
