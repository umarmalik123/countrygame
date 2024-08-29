from fuzzywuzzy import process
from tqdm import tqdm

# Print welcome message only once at the start
print("Welcome to the Country Guessing Game!")

countries = {
    'A': ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan'],
    'B': ['Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi'],
    'C': ['Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic (Czechia)'],
    'D': ['Denmark', 'Djibouti', 'Dominica', 'Dominican Republic'],
    'E': ['East Timor (Timor-Leste)', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia'],
    'F': ['Fiji', 'Finland', 'France'],
    'G': ['Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana'],
    'H': ['Haiti', 'Honduras', 'Hungary'],
    'I': ['Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy'],
    'J': ['Jamaica', 'Japan', 'Jordan'],
    'K': ['Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North (North Korea)', 'Korea, South (South Korea)', 'Kuwait', 'Kyrgyzstan'],
    'L': ['Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg'],
    'M': ['Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (Burma)'],
    'N': ['Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway'],
    'O': ['Oman'],
    'P': ['Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal'],
    'Q': ['Qatar'],
    'R': ['Romania', 'Russia', 'Rwanda'],
    'S': ['Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria'],
    'T': ['Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu'],
    'U': ['Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan'],
    'V': ['Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam'],
    'Y': ['Yemen'],
    'Z': ['Zambia', 'Zimbabwe']
}
# Initialize variables
guessed_countries = []
total_countries = sum(len(country_list) for country_list in countries.values())

# Initialize the progress bar with a clean format
progress_bar = tqdm(
    total=total_countries, 
    desc="Countries Guessed", 
    ncols=100, 
    bar_format="{l_bar}{bar}"
)

def check_country(guess):
    first_letter = guess[0].upper()
    possible_countries = countries.get(first_letter, [])
    match, score = process.extractOne(guess, possible_countries)

    if score >= 80:
        if match not in guessed_countries:
            guessed_countries.append(match)
            progress_bar.update(1)  # Update the progress bar by 1 step
            return True, f"{match} is correct (you entered: {guess})!"
        else:
            return False, f"{match} has already been guessed (you entered: {guess})."
    else:
        return False, f"No close match found for {guess}."

def display_guessed_countries():
    if not guessed_countries:
        return "You haven't guessed any countries yet."
    return "Countries you've guessed:\n" + "\n".join(sorted(guessed_countries))

while True:
    guess = input("\nEnter a country (or type 'exit' to stop, 'list' to see guessed countries): ").strip()
    if guess.lower() == 'exit':
        break
    elif guess.lower() == 'list':
        tqdm.write(display_guessed_countries())
    else:
        correct, message = check_country(guess)
        tqdm.write(message)  # Use tqdm.write instead of print for clean output

# Close the progress bar when done
progress_bar.close()