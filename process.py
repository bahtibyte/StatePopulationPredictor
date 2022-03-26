import csv

states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 
        'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 
        'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

transfers = {}
rates = {}
edges = {}

for start in states:
    transfers[start], rates[start], edges[start] = {}, {}, {}
    for end in states:
        transfers[start][end] = {}
        rates[start][end] = {}
        edges[start][end] = {}


for year in range(2010, 2020):
    with open(f'data/table_{year}.csv', 'r') as file:
        reader = csv.reader(file)
        fields = next(reader)
        usa = next(reader) # ignore the data about usa stats

        population = {}
        for row in reader:
            population[row[0]] = row[1]

            for i in range(4, len(fields)):
                edges[fields[i]][row[0]] = row[i]   # sets the count of ppl moving from start->end 

        highest = 0

        best_start = None
        best_end = None

        print()
        for start in edges:
            for end in edges[start]:
                rates[start][end][year] = int(edges[start][end]) * 1.0 / int(population[start])
                transfers[start][end][year] = edges[start][end]

                if rates[start][end][year] > highest:
                    highest = rates[start][end][year]
                    best_start = start
                    best_end = end

        print('year',year,'result:',best_start,'to',best_end,'rate of change of',highest, 'total left:',transfers[best_start][best_end][year])


for year in range(2010, 2020):
    x = 'Nevada'
    y = 'Texas'

    print(f"{transfers[x][y][year]} people left {x} to go to {y} during {year}. The rate of ppl leaving {x} was {rates[x][y][year]}")

