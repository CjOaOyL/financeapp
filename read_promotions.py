import PyPDF2, os, glob

folder = r'C:\Users\jaqua\Downloads\JKL_Resumes\JKL_Resumes\Promotion Announcements'
output_file = r'C:\Users\jaqua\Calculus\all_promotions_text.txt'
pdfs = sorted(glob.glob(os.path.join(folder, '*.pdf')))
sep = '=' * 80

with open(output_file, 'w', encoding='utf-8') as out:
    for pdf_path in pdfs:
        fname = os.path.basename(pdf_path)
        out.write(f'\n{sep}\n')
        out.write(f'FILE: {fname}\n')
        out.write(f'{sep}\n')
        try:
            reader = PyPDF2.PdfReader(pdf_path)
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    out.write(f'--- Page {i+1} ---\n')
                    out.write(text + '\n')
        except Exception as e:
            out.write(f'ERROR reading {fname}: {e}\n')

print(f'Done. Written to {output_file}')
size = os.path.getsize(output_file)
print(f'File size: {size:,} bytes')
