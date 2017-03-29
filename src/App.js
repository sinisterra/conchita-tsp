import React, { Component } from 'react';
import { links, cities, encodeAsLinks, generateInitialPopulation, fitness, runGeneration } from './CoffeeMule'
import { values, shuffle, range, indexOf, map, max, min, get, forEach } from 'lodash'
import * as d3 from 'd3'

import './App.css'

class App extends Component {

  state = {
    solutionIndex: 0,
    generations: 100,
    history: []
  }

  componentDidMount() {
    const population = generateInitialPopulation(10)
    this.setState({
      initialPopulation: population,
      currentPopulation: population
    })
  }

  _viewNextSolution = () => {
    this.setState({
      solutionIndex: min([100, this.state.solutionIndex + 1])
    })
  }

  _viewPrevSolution = () => {
    this.setState({
      solutionIndex: max([0, this.state.solutionIndex - 1])
    })
  }


  _runGeneration = () => {
    this.setState({
      // history: [...this.state.history, this.state.currentPopulation],
      currentPopulation: runGeneration(this.state.currentPopulation)
    })
  }

  _autoRun = () => {
    // let history = [...this.state.history]
    let currentPopulation = {...this.state.currentPopulation}
    forEach(range(this.state.generations), (i) => {
      currentPopulation = runGeneration(currentPopulation)
      // history.push(currentPopulation)
    })
    this.setState({currentPopulation})
  }

  render() {
    const route = get(this.state.currentPopulation, 0) || []
    const displayedRoute = encodeAsLinks(route)

    const lineDrawer = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => d.x1)
      .y(d => d.y1)

    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
         {/* <button onClick={ this._viewPrevSolution }>
            { `<< Previo` }
          </button>*/}
          <fieldset>
            <legend>Población</legend>
          <span>Fitness: { fitness(route) }</span>
          </fieldset>
          <fieldset>
            <legend>Número de generaciones</legend>
          <button onClick={ this._runGeneration } style={{margin: '0px 32px'}}>
            { `Próxima generación` }
          </button>

          <input type="number" value={this.state.generations} onChange={({target: {name, value}}) => {
            this.setState({[name]: value})
          }} name="generations"/>
           <button onClick={ this._autoRun }>
            { `Ejecutar` }
          </button>
          </fieldset>
        </div>
        <svg
          width={ 1200 }
          height={ 500 }>
          { values(links).map(({d, label, m1, m2, ...dimensions}) => {
            
              const isInRoute = indexOf(displayedRoute, label) !== -1
            
              return (
              isInRoute ? <g
                       className="link"
                       opacity={1}>
                       <path
                         fill={ 'none' }
                         stroke={ isInRoute ? 'black' : 'black' }
                         d={ lineDrawer([{
                               x1: dimensions.x1,
                               y1: dimensions.y1
                             }, {
                               x1: dimensions.x2,
                               y1: dimensions.y2
                             }]) } />
                       <rect />
                       <text
                         textAnchor={ 'middle' }
                         x={ m1 + 10 }
                         y={ m2 + 2 }
                         fill={ isInRoute ? 'black' : 'red' }
                         fontSize={ 12 }>
                         { d }
                       </text>
                     </g> : null
              )
            }) }
          { cities.map(({city, x, y}) => {
              const isStartingPoint = route[0] === city
              const isEndingPoint = route[route.length - 1] === city
            
              return (
                <g transform={ `translate(${x},${y})` }>
                  <circle
                    r={ isStartingPoint || isEndingPoint ? 20 : 10 }
                    fill={ isStartingPoint ? 'green' : isEndingPoint ? 'red' : 'black' } />
                  <text
                    fill={ 'white' }
                    textAnchor={ 'middle' }
                    x={ 0 }
                    y={ 5 }>
                    { city }
                  </text>
                </g>
              )
            }) }
        </svg>
      </div>
    );
  }
}

export default App;
