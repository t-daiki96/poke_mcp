# Pokémon MCP Server

A Model Context Protocol (MCP) server that provides Pokémon stats and images using the PokeAPI.

## Features

- **get_pokemon_stats**: Get Pokémon base stats (HP, Attack, Defense, Special Attack, Special Defense, Speed)
- **get_pokemon_images**: Get Pokémon sprite images (front, back, shiny variants, and official artwork)
- **get_pokemon_info**: Get complete Pokémon information including stats, images, and basic info

## Installation

```bash
npm install
npm run build
```

## Usage

### Running the server

```bash
npm start
```

### Available Tools

1. **get_pokemon_stats**
   - Returns base stats for a Pokémon
   - Parameter: `pokemon` (string) - Pokémon name or ID number

2. **get_pokemon_images**
   - Returns sprite URLs for a Pokémon
   - Parameter: `pokemon` (string) - Pokémon name or ID number

3. **get_pokemon_info**
   - Returns complete Pokémon information
   - Parameter: `pokemon` (string) - Pokémon name or ID number

### Examples

```json
// Get Pikachu's stats
{
  "pokemon": "pikachu"
}

// Get Charizard's images
{
  "pokemon": "charizard"
}

// Get complete info for Pokémon #25
{
  "pokemon": "25"
}
```

## Response Format

### Stats Response
```json
{
  "name": "pikachu",
  "id": 25,
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "special-attack": 50,
    "special-defense": 50,
    "speed": 90
  },
  "types": ["electric"],
  "base_experience": 112
}
```

### Images Response
```json
{
  "name": "pikachu",
  "id": 25,
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "front_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
    "back_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png",
    "back_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/25.png",
    "official_artwork": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
  }
}
```

## API Source

This server uses the [PokeAPI](https://pokeapi.co/) to fetch Pokémon data.