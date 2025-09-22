# Pokémon MCP Server

A Model Context Protocol (MCP) server that provides Pokémon stats and images using the PokeAPI.

## Features

- **get_pokemon_stats**: Get Pokémon base stats (HP, Attack, Defense, Special Attack, Special Defense, Speed)
- **get_pokemon_images**: Get Pokémon sprite images (front, back, shiny variants, and official artwork)
- **get_pokemon_info**: Get complete Pokémon information including stats, images, and basic info
- **get_pokemon_cry**: Get Pokémon cry sound file URL from PokeAPI/cries repository
- **play_pokemon_cry**: Download and play Pokémon cry sound (platform-specific audio playback)

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

4. **get_pokemon_cry**
   - Returns Pokémon cry sound file URL
   - Parameter: `pokemon` (string) - Pokémon name or ID number

5. **play_pokemon_cry**
   - Downloads and plays Pokémon cry sound
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

// Get Pikachu's cry sound URL
{
  "pokemon": "pikachu"
}

// Play Charizard's cry sound
{
  "pokemon": "charizard"
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

### Cry Response
```json
{
  "name": "pikachu",
  "id": 25,
  "cry_url": "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
  "format": "ogg",
  "source": "PokeAPI/cries repository"
}
```

### Play Cry Response
```json
{
  "name": "pikachu",
  "id": 25,
  "cry_url": "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
  "status": "再生完了",
  "platform": "win32",
  "file_saved_temporarily": "C:\\path\\to\\temp\\pikachu_cry.ogg"
}
```

## API Source

This server uses the [PokeAPI](https://pokeapi.co/) to fetch Pokémon data and [PokeAPI/cries](https://github.com/PokeAPI/cries) repository for sound files.