import fitz
import json
import re
from datetime import datetime

pdf = fitz.open('c:\\Users\\jaqua\\Downloads\\Apple Card Statement - August 2025.pdf')
print(f'Total pages: {pdf.page_count}')

# Extract text from page 1 (transactions) and get raw text
all_transactions = []

# Try pages 1-6 for transactions (page 0 is summary)
for page_num in range(1, min(pdf.page_count, 7)):
    page = pdf[page_num]
    text = page.get_text()
    
    # Write page to file for inspection
    with open(f'page_{page_num}_raw.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    
    print(f'\nPage {page_num} extracted to page_{page_num}_raw.txt')

print('\nNow extracting structured data...')

# Try to find transaction patterns
# Apple Card statements typically have: Date Description Amount
page1_text = pdf[1].get_text()

# Try using dict output which might have better position data
page1_dict = pdf[1].get_text('dict')
print(f'\nPage 1 structure (blocks): {len(page1_dict["blocks"])} blocks')

# Show first few blocks
for i, block in enumerate(page1_dict['blocks'][:10]):
    if block['type'] == 0:  # text block
        print(f'Block {i}: {block.get("bbox")} - {len(block.get("lines", []))} lines')
        for j, line in enumerate(block.get('lines', [])[:2]):
            text = ''.join(span['text'] for span in line['spans'])
            print(f'  Line {j}: {text[:80]}')
