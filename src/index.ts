// MCPサーバーSDKとHTTPクライアントのインポート
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// ポケモンのステータス情報の型定義
interface PokemonStats {
  hp: number;                    // HP（ヒットポイント）
  attack: number;                // こうげき
  defense: number;               // ぼうぎょ
  "special-attack": number;      // とくこう
  "special-defense": number;     // とくぼう
  speed: number;                 // すばやさ
}

// PokeAPIから取得するポケモンデータの型定義
interface PokemonData {
  id: number;                    // ポケモンID
  name: string;                  // ポケモン名
  height: number;                // 身長
  weight: number;                // 体重
  base_experience: number;       // 基礎経験値
  stats: Array<{                 // ステータス配列
    base_stat: number;           // 基礎ステータス値
    stat: {
      name: string;              // ステータス名
    };
  }>;
  sprites: {                     // スプライト画像URL
    front_default: string | null;    // 通常の前面画像
    front_shiny: string | null;      // 色違いの前面画像
    back_default: string | null;     // 通常の後面画像
    back_shiny: string | null;       // 色違いの後面画像
    other: {
      "official-artwork": {
        front_default: string | null;  // 公式アートワーク
      };
    };
  };
  types: Array<{                 // タイプ配列
    type: {
      name: string;              // タイプ名
    };
  }>;
}

// ポケモンMCPサーバークラス
class PokemonMCPServer {
  private server: Server;

  constructor() {
    // MCPサーバーの初期化
    this.server = new Server(
      {
        name: "pokemon-mcp-server",    // サーバー名
        version: "1.0.0",             // バージョン
      },
      {
        capabilities: {
          tools: {},                   // ツール機能を有効化
        },
      }
    );

    this.setupToolHandlers();         // ツールハンドラーのセットアップ
  }

  // ツールハンドラーのセットアップ
  private setupToolHandlers() {
    // 利用可能なツール一覧を返すハンドラー
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_pokemon_stats",
          description: "ポケモンの基礎ステータス（HP、こうげき、ぼうぎょ、とくこう、とくぼう、すばやさ）を取得",
          inputSchema: {
            type: "object",
            properties: {
              pokemon: {
                type: "string",
                description: "ポケモン名またはID番号",
              },
            },
            required: ["pokemon"],
          },
        },
        {
          name: "get_pokemon_images",
          description: "ポケモンのスプライト画像（前面、後面、色違い、公式アートワーク）を取得",
          inputSchema: {
            type: "object",
            properties: {
              pokemon: {
                type: "string",
                description: "ポケモン名またはID番号",
              },
            },
            required: ["pokemon"],
          },
        },
        {
          name: "get_pokemon_info",
          description: "ポケモンの完全な情報（ステータス、画像、基本情報）を取得",
          inputSchema: {
            type: "object",
            properties: {
              pokemon: {
                type: "string",
                description: "ポケモン名またはID番号",
              },
            },
            required: ["pokemon"],
          },
        },
      ],
    }));

    // ツール呼び出しリクエストを処理するハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error("引数が不足しています");
      }

      // リクエストされたツールに応じて適切なメソッドを呼び出し
      if (name === "get_pokemon_stats") {
        return await this.getPokemonStats(args.pokemon as string);
      } else if (name === "get_pokemon_images") {
        return await this.getPokemonImages(args.pokemon as string);
      } else if (name === "get_pokemon_info") {
        return await this.getPokemonInfo(args.pokemon as string);
      }

      throw new Error(`不明なツール: ${name}`);
    });
  }

  // PokeAPIからポケモンデータを取得する共通メソッド
  private async fetchPokemonData(pokemon: string): Promise<PokemonData> {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`ポケモン "${pokemon}" が見つかりません`);
      }
      throw new Error(`ポケモンデータの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ポケモンのステータス情報を取得するメソッド
  private async getPokemonStats(pokemon: string) {
    try {
      const data = await this.fetchPokemonData(pokemon);

      // ステータス情報を初期化
      const stats: PokemonStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        "special-attack": 0,
        "special-defense": 0,
        speed: 0
      };

      // APIから取得したステータスデータを整形
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
            text: `エラー: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  // ポケモンの画像情報を取得するメソッド
  private async getPokemonImages(pokemon: string) {
    try {
      const data = await this.fetchPokemonData(pokemon);

      // 画像情報を整理
      const images = {
        name: data.name,
        id: data.id,
        sprites: {
          front_default: data.sprites.front_default,     // 通常の前面画像
          front_shiny: data.sprites.front_shiny,         // 色違いの前面画像
          back_default: data.sprites.back_default,       // 通常の後面画像
          back_shiny: data.sprites.back_shiny,           // 色違いの後面画像
          official_artwork: data.sprites.other["official-artwork"].front_default  // 公式アートワーク
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
            text: `エラー: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  // ポケモンの完全な情報（ステータス+画像+基本情報）を取得するメソッド
  private async getPokemonInfo(pokemon: string) {
    try {
      const data = await this.fetchPokemonData(pokemon);

      // ステータス情報を初期化
      const stats: PokemonStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        "special-attack": 0,
        "special-defense": 0,
        speed: 0
      };

      // APIから取得したステータスデータを整形
      data.stats.forEach(stat => {
        const statName = stat.stat.name as keyof PokemonStats;
        if (statName in stats) {
          stats[statName] = stat.base_stat;
        }
      });

      // 全ての情報をまとめたオブジェクトを作成
      const pokemonInfo = {
        id: data.id,                                       // ポケモンID
        name: data.name,                                   // ポケモン名
        height: data.height,                               // 身長
        weight: data.weight,                               // 体重
        base_experience: data.base_experience,             // 基礎経験値
        types: data.types.map(t => t.type.name),          // タイプ配列
        stats: stats,                                      // ステータス情報
        images: {                                          // 画像情報
          front_default: data.sprites.front_default,      // 通常の前面画像
          front_shiny: data.sprites.front_shiny,          // 色違いの前面画像
          back_default: data.sprites.back_default,        // 通常の後面画像
          back_shiny: data.sprites.back_shiny,            // 色違いの後面画像
          official_artwork: data.sprites.other["official-artwork"].front_default  // 公式アートワーク
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
            text: `エラー: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  // サーバーを起動するメソッド
  async run() {
    const transport = new StdioServerTransport();  // 標準入出力トランスポートを作成
    await this.server.connect(transport);          // サーバーに接続
  }
}

// サーバーインスタンスを作成して起動
const server = new PokemonMCPServer();
server.run().catch(console.error);