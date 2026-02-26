import fitz
import json
import re
from datetime import datetime

def extract_apple_card_transactions(pdf_path):
    """Extract transactions from Apple Card statement PDF"""
    pdf = fitz.open(pdf_path)
    transactions = []
    
    # Extract text from all pages
    all_text = ""
    for page_num in range(pdf.page_count):
        page = pdf[page_num]
        try:
            text = page.get_text()
            all_text += text + "\n"
        except:
            continue
    
    # Split by cardholder sections
    cardholder_sections = re.split(r'(Transactions by \w+ \w+|Payments made by \w+ \w+)', all_text)
    
    current_cardholder = None
    current_type = None  # "Payments" or "Transactions"
    
    i = 0
    while i < len(cardholder_sections):
        section = cardholder_sections[i]
        
        # Check if this is a section header
        payments_match = re.match(r'Payments made by (\w+ \w+)', section)
        transactions_match = re.match(r'Transactions by (\w+ \w+)', section)
        
        if payments_match:
            current_cardholder = payments_match.group(1)
            current_type = "Payments"
            i += 1
            continue
        elif transactions_match:
            current_cardholder = transactions_match.group(1)
            current_type = "Transactions"
            i += 1
            continue
        
        if current_cardholder and i > 0:
            # This section contains the actual data
            lines = section.split('\n')
            
            # Find lines with dates (MM/DD/YYYY format)
            j = 0
            while j < len(lines):
                line = lines[j].strip()
                
                # Check if line starts with a date
                date_match = re.match(r'^(\d{2}/\d{2}/\d{4})', line)
                if date_match:
                    date_str = date_match.group(1)
                    
                    # Extract the rest of the line after date
                    rest = line[len(date_str):].strip()
                    
                    # For payments: Date Description Amount
                    # For transactions: Date Description DailyCash% Amount
                    
                    # Look ahead to get multi-line descriptions and amounts
                    description_lines = [rest]
                    j += 1
                    
                    # Collect description lines until we find an amount
                    amount_line = None
                    while j < len(lines):
                        next_line = lines[j].strip()
                        
                        # Check if this line is an amount (starts with $ or -)
                        amount_match = re.match(r'^-?\$[\d,]+\.\d{2}', next_line)
                        daily_cash_match = re.match(r'^\d+%$', next_line)
                        
                        if amount_match or next_line.startswith('-$'):
                            # For transactions, there might be a daily cash line first
                            if current_type == "Transactions" and daily_cash_match:
                                description_lines.append(next_line)
                                j += 1
                                # Next line should be the amount
                                if j < len(lines):
                                    amount_line = lines[j].strip()
                            else:
                                amount_line = next_line
                            break
                        elif next_line and not amount_match and not next_line.startswith('Total') and not next_line.startswith('Page'):
                            description_lines.append(next_line)
                            j += 1
                        else:
                            break
                    
                    if amount_line:
                        # Extract amount
                        amount_match = re.search(r'-?\$[\d,]+\.\d{2}', amount_line)
                        if amount_match:
                            amount_str = amount_match.group(0)
                            amount = float(amount_str.replace('$', '').replace(',', ''))
                            
                            # Join description
                            full_description = ' '.join(description_lines).strip()
                            
                            # Remove daily cash % if it's in the description
                            full_description = re.sub(r'\s+\d+%\s*', ' ', full_description).strip()
                            
                            transaction = {
                                'date': date_str,
                                'description': full_description,
                                'amount': amount,
                                'cardholder': current_cardholder,
                                'type': current_type,
                                'account': 'Apple Card'
                            }
                            
                            transactions.append(transaction)
                    
                    j += 1
                else:
                    j += 1
        
        i += 1
    
    return transactions

# Extract transactions
pdf_path = 'c:\\Users\\jaqua\\Downloads\\Apple Card Statement - August 2025.pdf'
transactions = extract_apple_card_transactions(pdf_path)

print(f'Extracted {len(transactions)} transactions\n')

# Group by cardholder
from collections import defaultdict
by_cardholder = defaultdict(list)
for t in transactions:
    by_cardholder[t['cardholder']].append(t)

for cardholder in sorted(by_cardholder.keys()):
    trans_list = by_cardholder[cardholder]
    payment_total = sum(t['amount'] for t in trans_list if t['type'] == 'Payments')
    transaction_total = sum(t['amount'] for t in trans_list if t['type'] == 'Transactions')
    print(f'{cardholder}:')
    print(f'  Payments: {len([t for t in trans_list if t["type"] == "Payments"])} items, total: ${payment_total:,.2f}')
    print(f'  Transactions: {len([t for t in trans_list if t["type"] == "Transactions"])} items, total: ${transaction_total:,.2f}')
    print()

# Save to JSON
with open('apple_card_transactions.json', 'w', encoding='utf-8') as f:
    json.dump(transactions, f, indent=2, ensure_ascii=False)

print(f'Saved to apple_card_transactions.json')

# Show sample
print('\nSample transactions:')
for t in transactions[:10]:
    print(f'{t["date"]} | {t["cardholder"]:20} | {t["description"][:50]:50} | ${t["amount"]:>8.2f}')
