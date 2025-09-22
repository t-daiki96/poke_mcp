import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  "special-attack": number;
  "special-defense": number;
  speed: number;
}

interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

class PokemonMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "pokemon-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_pokemon_stats",
          description: "Get Pokémon base stats (HP, Attack, Defense, Special Attack, Special Defense, Speed)",
          inputSchema: {
            type: "object",
            properties: {
              pokemon: {
                type: "string",
                description: "Pokémon name or ID number",
              },
            },
            required: ["pokemon"],
          },
        },
        {
          name: "get_pokemon_images",
          description: "Get Pokémon sprite images (front, back, shiny variants, and official artwork)",
          inputSchema: {
            type: "object",
            properties: {
              pokemon: {
                type: "string",
                description: "Pokémon name or ID number",
              },
            },
            required: ["pokemon"],
          },
        },
        {
          name: "get_pokemon_info",
          description: "Get complete Pokémon information including stats, images, and basic info",
          inputSchema: {
            type: "object",
            properties: {
              pokemon: {
                type: "string",
                description: "Pokémon name or ID number",
              },
            },
            required: ["pokemon"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error("Missing arguments");
      }

      if (name === "get_pokemon_stats") {
        return await this.getPokemonStats(args.pokemon as string);
      } else if (name === "get_pokemon_images") {
        return await this.getPokemonImages(args.pokemon as string);
      } else if (name === "get_pokemon_info") {
        return await this.getPokemonInfo(args.pokemon as string);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  private async fetchPokemonData(pokemon: string): Promise<PokemonData> {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Pokémon "${pokemon}" not found`);
      }
      throw new Error(`Failed to fetch Pokémon data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getPokemonStats(pokemon: string) {
    try {
      const data = await this.fetchPokemonData(pokemon);

      const stats: PokemonStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        "special-attack": 0,
        "special-defense": 0,
        speed: 0
      };

      data.stats.forEach(stat => {
        const statName = stat.stat.name as keyof PokemonStats;
        if (statName in stats) {
          stats[statName] = stat.base_stat;
        }
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              name: data.name,
              id: data.id,
              stats: stats,
              types: data.types.map(t => t.type.name),
              base_experience: data.base_experience
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  private async getPokemonImages(pokemon: string) {
    try {
      const data = await this.fetchPokemonData(pokemon);

      const images = {
        name: data.name,
        id: data.id,
        sprites: {
          front_default: data.sprites.front_default,
          front_shiny: data.sprites.front_shiny,
          back_default: data.sprites.back_default,
          back_shiny: data.sprites.back_shiny,
          official_artwork: data.sprites.other["official-artwork"].front_default
        }
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(images, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  private async getPokemonInfo(pokemon: string) {
    try {
      const data = await this.fetchPokemonData(pokemon);

      const stats: PokemonStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        "special-attack": 0,
        "special-defense": 0,
        speed: 0
      };

      data.stats.forEach(stat => {
        const statName = stat.stat.name as keyof PokemonStats;
        if (statName in stats) {
          stats[statName] = stat.base_stat;
        }
      });

      const pokemonInfo = {
        id: data.id,
        name: data.name,
        height: data.height,
        weight: data.weight,
        base_experience: data.base_experience,
        types: data.types.map(t => t.type.name),
        stats: stats,
        images: {
          front_default: data.sprites.front_default,
          front_shiny: data.sprites.front_shiny,
          back_default: data.sprites.back_default,
          back_shiny: data.sprites.back_shiny,
          official_artwork: data.sprites.other["official-artwork"].front_default
        }
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(pokemonInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new PokemonMCPServer();
server.run().catch(console.error);