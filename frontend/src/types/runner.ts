/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/runner.json`.
 */
export type Runner = {
  "address": "5DZS318TbttrDoKdVLeCE4dMcUjMjw9fkvUV2u1vKtRe",
  "metadata": {
    "name": "runner",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Runner - Web3 Jackpot Game"
  },
  "instructions": [
    {
      "name": "endBetting",
      "docs": [
        "End the betting phase (called by authority)"
      ],
      "discriminator": [
        115,
        142,
        179,
        48,
        13,
        219,
        11,
        82
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "race",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "race.race_id",
                "account": "race"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "globalState"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initializeGlobalState",
      "docs": [
        "Initialize the global state (one-time setup)"
      ],
      "discriminator": [
        232,
        254,
        209,
        244,
        123,
        89,
        154,
        207
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rakeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeRace",
      "docs": [
        "Initialize a new race"
      ],
      "discriminator": [
        12,
        16,
        142,
        69,
        46,
        238,
        139,
        31
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "race",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "global_state.current_race_id",
                "account": "globalState"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "globalState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "serverSeedHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "resolutionSlot",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeBet",
      "docs": [
        "Place a bet on the current race"
      ],
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "race",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "race.race_id",
                "account": "race"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "race.race_id",
                "account": "race"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveRace",
      "docs": [
        "Resolve the race using slot hash + server seed"
      ],
      "discriminator": [
        181,
        252,
        7,
        209,
        242,
        100,
        95,
        172
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "race",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "race.race_id",
                "account": "race"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "race.race_id",
                "account": "race"
              }
            ]
          }
        },
        {
          "name": "slotHashes",
          "address": "SysvarS1otHashes111111111111111111111111111"
        },
        {
          "name": "winner",
          "writable": true
        },
        {
          "name": "feeWallet",
          "writable": true,
          "relations": [
            "globalState"
          ]
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "globalState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "serverSeed",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "race",
      "discriminator": [
        114,
        93,
        186,
        119,
        99,
        123,
        162,
        192
      ]
    }
  ],
  "events": [
    {
      "name": "betPlaced",
      "discriminator": [
        88,
        88,
        145,
        226,
        126,
        206,
        32,
        0
      ]
    },
    {
      "name": "bettingEnded",
      "discriminator": [
        67,
        92,
        219,
        184,
        51,
        153,
        184,
        211
      ]
    },
    {
      "name": "raceInitialized",
      "discriminator": [
        149,
        48,
        200,
        188,
        243,
        189,
        230,
        136
      ]
    },
    {
      "name": "raceResolved",
      "discriminator": [
        45,
        151,
        108,
        227,
        64,
        209,
        32,
        144
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidRaceState",
      "msg": "The race is not in the correct state for this operation"
    },
    {
      "code": 6001,
      "name": "bettingNotEnded",
      "msg": "Betting deadline has not been reached yet"
    },
    {
      "code": 6002,
      "name": "bettingEnded",
      "msg": "Betting deadline has already passed"
    },
    {
      "code": 6003,
      "name": "betTooLow",
      "msg": "Bet amount is below the minimum"
    },
    {
      "code": 6004,
      "name": "betTooHigh",
      "msg": "Bet amount exceeds the maximum"
    },
    {
      "code": 6005,
      "name": "maxPlayersReached",
      "msg": "Maximum number of players reached"
    },
    {
      "code": 6006,
      "name": "resolutionSlotNotReached",
      "msg": "Resolution slot has not been reached yet"
    },
    {
      "code": 6007,
      "name": "invalidServerSeed",
      "msg": "Server seed does not match the committed hash"
    },
    {
      "code": 6008,
      "name": "slotHashNotFound",
      "msg": "Slot hash not found in SlotHashes sysvar"
    },
    {
      "code": 6009,
      "name": "noPlayers",
      "msg": "No players in the race"
    },
    {
      "code": 6010,
      "name": "winnerNotFound",
      "msg": "Winner not found (should never happen)"
    },
    {
      "code": 6011,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6012,
      "name": "invalidAuthority",
      "msg": "Invalid authority"
    }
  ],
  "types": [
    {
      "name": "betPlaced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raceId",
            "type": "u64"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalPot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bettingEnded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raceId",
            "type": "u64"
          },
          {
            "name": "totalPot",
            "type": "u64"
          },
          {
            "name": "playersCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that can manage races"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "docs": [
              "Wallet that receives rake fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "rakeBps",
            "docs": [
              "Rake percentage in basis points (150 = 1.5%)"
            ],
            "type": "u16"
          },
          {
            "name": "currentRaceId",
            "docs": [
              "Current race ID counter"
            ],
            "type": "u64"
          },
          {
            "name": "totalRaces",
            "docs": [
              "Total number of races completed"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "betAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "race",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raceId",
            "docs": [
              "Unique race identifier"
            ],
            "type": "u64"
          },
          {
            "name": "state",
            "docs": [
              "Current state of the race"
            ],
            "type": {
              "defined": {
                "name": "raceState"
              }
            }
          },
          {
            "name": "serverSeedHash",
            "docs": [
              "Hash of the server seed (committed before betting ends)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "resolutionSlot",
            "docs": [
              "Solana slot number for resolution"
            ],
            "type": "u64"
          },
          {
            "name": "deadline",
            "docs": [
              "Betting deadline timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "totalPot",
            "docs": [
              "Total pot in lamports"
            ],
            "type": "u64"
          },
          {
            "name": "players",
            "docs": [
              "List of players and their bets"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "player"
                }
              }
            }
          },
          {
            "name": "winner",
            "docs": [
              "Winner's public key (after resolution)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "prize",
            "docs": [
              "Prize amount paid to winner"
            ],
            "type": "u64"
          },
          {
            "name": "randomSeed",
            "docs": [
              "Final random seed (for verification)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "resolvedAt",
            "docs": [
              "Resolution timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raceInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raceId",
            "type": "u64"
          },
          {
            "name": "serverSeedHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "resolutionSlot",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "raceResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raceId",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "prize",
            "type": "u64"
          },
          {
            "name": "rake",
            "type": "u64"
          },
          {
            "name": "randomSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "raceState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "betting"
          },
          {
            "name": "running"
          },
          {
            "name": "finished"
          }
        ]
      }
    }
  ]
};
