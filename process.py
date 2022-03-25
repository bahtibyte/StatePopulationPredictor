import csv


for year in range(2010, 2020):
    data = {}

    with open(f'data/table_{year}.csv', 'r') as file:
        reader = csv.reader(file)
        fields = next(reader)
        usa = next(reader) # ignore the data about usa stats

        population = {}
        data[year] = {}
        edges = data[year]

        for i in range(4, len(fields)):
            edges[fields[i]] = {}  # Creates a empty edge for all states available

        for row in reader:
            population[row[0]] = row[1]

            for i in range(4, len(fields)):
                edges[fields[i]][row[0]] = row[i]   # sets the count of ppl moving from start->end 

        highest = 0

        best_start = None
        best_end = None

        for start in edges:
            for end in edges[start]:
                edges[start][end] = {
                    'value': edges[start][end],
                    'rate': int(edges[start][end]) * 1.0 / int(population[start])
                }

                if edges[start][end]['rate'] > highest:
                    highest = edges[start][end]['rate']
                    best_start = start
                    best_end = end

        print('year',year,'result:',best_start,'to',best_end,'rate of change of',highest, 'total left:',edges[best_start][best_end]['value'])



