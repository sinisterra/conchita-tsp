import { sample, difference, fill, forEach, sampleSize, random, range, map, min, sum, groupBy, mapValues, pop, sortBy, shuffle, get, reverse, slice, zip, chunk, flatten, max } from 'lodash'
import _ from 'lodash'
import 'lodash.combinations'

const CITY_COUNT = 25
const POPULATION_SIZE = 50
const ELITISM_PERCENTAGE = 0.25
const MUTATION_PERCENTAGE = 0.1
const W = 1200 
const H = 500

const generateCities = (cities) => {
  const generateCoordinate = (max) => random(0, max)

  return map(range(cities), city => {
    const x =  (W * (city / cities)) + 20
    const y = generateCoordinate(H - 20) + 20
    return ({
      city,
      x,
      y
    })
  })
}

const distance = (c1, c2) => {
  const keys = map(['x', 'y'], (k, i) => {
    const coordinates = map([c1, c2], c => c[k])
    return Math.abs((coordinates[1] - coordinates[0]))
  })

  return Math.round(Math.sqrt(sum(keys)))
}

const midpoint = (c1, c2) => {
  const keys = map(['x', 'y'], (k, i) => {
    const coordinates = map([c1, c2], c => c[k])
    return (coordinates[1] + coordinates[0]) / 2
  })

  const [m1, m2] = keys

  return {
    m1,
    m2
  }
}

export const cities = generateCities(CITY_COUNT)
export const links = map(_.combinations(cities, 2), pair => {
  const [c1, c2] = pair
  return {
    label: `${c1.city},${c2.city}`,
    x1: c1.x,
    x2: c2.x,
    y1: c1.y,
    y2: c2.y,
    d: distance(c1, c2),
    ...midpoint(c1, c2)
  }
})

const linksByLabel = mapValues(groupBy(links, 'label'), v => v[0])

export const encodeAsLinks = (vector) => {

  let s = map(vector, (v, i) => {

    const first = vector[i]
    const second = vector[i + 1]
    if (second === undefined) {
      return null
    }
    const [n1, n2] = sortBy([first, second])

    return `${n1},${n2}`

  })
  s.pop()

  return s
}

export const run = () => {

}

let list = []

export const runGeneration = (population) => {

  const evaluatedPopulation = map(population, chromosome => ({
    chromosome,
    fitness: fitness(chromosome)
  }))
  const sortedPopulation = sortBy(evaluatedPopulation, ({fitness}) => fitness)

  const selectedPopulation = eliteSelector(sortedPopulation)
  const crossedPopulation = crossPopulation(selectedPopulation)


  const refillPopulation = [...map(selectedPopulation, ({chromosome}) => chromosome), ...crossedPopulation, ...generateInitialPopulation(POPULATION_SIZE - crossedPopulation.length - selectedPopulation.length)]


  let s = sortBy(refillPopulation, c => fitness(c))
  const diff = Math.abs(fitness(s[0]) - fitness(population[0]))
  list.push(diff)

  console.log(list.length, {
    diff,
    f: fitness(s[0]),
    ind: s[0]
  })

  // console.log('running')

  return s
}

const eliteSelector = (sortedPopulation) => {
  const pct = Math.round(sortedPopulation.length * ELITISM_PERCENTAGE)
  return slice(sortedPopulation, 0, max([2, pct % 2 == 0 ? pct : pct + 1]))
}

const crossPopulation = (pop) => {

  const shuffledPop = shuffle(pop)
  const dividedInPairs = chunk(shuffledPop, 2)
  const mating = dividedInPairs.map(([p1, p2]) => crossover(p1, p2))

  return flatten(mating)

}

export const generateInitialPopulation = (size = POPULATION_SIZE) => {
  const generateIndividual = () => {
    return shuffle(range(CITY_COUNT))
  }
  return sortBy(range(size).map(generateIndividual), i => fitness(i))
}

const mutation = (chromosome) => {
  if (Math.random() < MUTATION_PERCENTAGE) {

    const onePoint = sampleSize(range(CITY_COUNT), sample(range(0, CITY_COUNT, 2)))
    let mutated = [...chromosome]
    forEach(chunk(onePoint, 2), ([point1, point2]) => {

      let tmp = mutated[point1]
      mutated[point1] = mutated[point2]
      mutated[point2] = tmp
    })
    return mutated
  }
  return chromosome
}

const crossover = (p1, p2) => {

  const getASon = (parent1, parent2) => {

    const halfwayPoint = Math.floor(parent1.chromosome.length / 2)
    const initialPoint = random(0, halfwayPoint)
    const endPoint = random(halfwayPoint + 1, parent1.chromosome.length - 1)

    let parentSection = slice(parent1.chromosome, initialPoint, endPoint)

    let son = map(fill(Array(CITY_COUNT), null), (e, i) => {
      return i >= initialPoint && i < endPoint ? parent1.chromosome[i] : null
    })

    const numbersToAdd = difference(parent2.chromosome, parentSection)

    son = map(son, s => {
      if (s === null) {
        return numbersToAdd.pop()
      }
      else return s
    })

    return son
  }

  const o1 = getASon(p1, p2)
  const o2 = getASon(p2, p1)



  return map([o1, o2], mutation)
}


export const fitness = (chromosome) => {
  const linksFromVector = encodeAsLinks(chromosome)
  return sum(map(linksFromVector, l => {
    if (get(linksByLabel, l) === undefined) {
      debugger
    }
    return get(linksByLabel, l).d
  }))
}