# File paths
input_file = 'words.txt'
output_file = '4letter.txt'

# Function to check if a word has exactly 4 letters
def is_valid_word(word):
    return len(word) == 4

# Read the input file and process the words
with open(input_file, 'r', encoding='utf-8') as file:
    words = file.readlines()

# Filter words
filtered_words = [word.strip() for word in words if is_valid_word(word.strip())]

# Write the filtered words to the output file
with open(output_file, 'w', encoding='utf-8') as file:
    for word in filtered_words:
        file.write(word + '\n')

print(f"Filtered words have been written to {output_file}")
