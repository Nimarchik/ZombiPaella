import { supabase } from "./supabase";

export const getGameByRoom = async (roomId) => {
  return await supabase
    .from("games")
    .select("*")
    .eq("room_id", roomId)
    .single();
};


export const getGamePlayers = async (gameId) => {
  return await supabase
    .from("game_players")
    .select(`
            id,
            player_id,
            seat,
            profiles (
                id,
                nickname,
                avatar
            )
        `)
    .eq("game_id", gameId)
    .order("seat");
};


export const getMyHand = async (
  gameId,
  userId
) => {
  return await supabase
    .from("game_cards")
    .select(`
            id,
            owner_id,
            zone,

            card:card_definitions (
                id,
                name,
                type,
                subtype,
                is_ingredient,
                attack,
                defense,
                power,
                effect_key,
                image_path
            )
        `)
    .eq("game_id", gameId)
    .eq("owner_id", userId)
    .eq("zone", "hand");
};


export const getTreasures = async (gameId) => {
  return await supabase
    .from("game_cards")
    .select(`
            id,
            owner_id,
            zone,

            card:card_definitions (
                id,
                name,
                type,
                subtype,
                is_ingredient,
                image_path,
                effect_key
            )
        `)
    .eq("game_id", gameId)
    .eq("zone", "treasure");
};

export const getHandCounts = async (gameId) => {
  return await supabase.rpc(
    "get_game_hand_counts",
    {
      p_game_id: gameId,
    }
  );
};


export const drawCard =
  async (
    gameId,
    mode
  ) => {

    const {
      data,
      error,
    } = await supabase.rpc(
      "draw_card",
      {
        p_game_id: gameId,
        p_mode: mode,
      }
    );


    return {
      result: data,
      error,
    };
  };

export const getDeckCount = async (gameId) => {
  return await supabase.rpc(
    "get_deck_count",
    {
      p_game_id: gameId,
    }
  );
};

export const getSaffron =
  async (gameId) => {

    return await supabase
      .from("game_cards")
      .select(`
                id,
                owner_id,
                zone,

                card:card_definitions (
                    id,
                    name,
                    type,
                    subtype,
                    is_ingredient,
                    image_path,
                    effect_key
                )
            `)
      .eq(
        "game_id",
        gameId
      )
      .eq(
        "zone",
        "saffron"
      )
      .maybeSingle();

  };

export async function startBattle(
  gameId,
  attackCardId,
  targetTreasureId,
  supportCardIds = []
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "start_battle_with_supports",
    {
      p_game_id: gameId,

      p_attack_card_id:
        attackCardId,

      p_target_treasure_id:
        targetTreasureId,

      p_support_card_ids:
        supportCardIds,
    }
  );


  if (error) {
    console.error(
      "START BATTLE ERROR:",
      error
    );

    return {
      battleId: null,
      error,
    };
  }


  return {
    battleId: data,
    error: null,
  };
}


export async function respondBattle(
  battleId,
  defenseCardId = null,
  supportCardIds = []
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "respond_battle_with_supports",
    {
      p_battle_id:
        battleId,

      p_defense_card_id:
        defenseCardId,

      p_support_card_ids:
        supportCardIds,
    }
  );


  if (error) {
    console.error(
      "RESPOND BATTLE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }


  return {
    result: data,
    error: null,
  };
}


export const getActiveBattle =
  async (gameId) => {

    return await supabase
      .from("game_battles")
      .select("*")
      .eq(
        "game_id",
        gameId
      )
      .eq(
        "status",
        "waiting_defense"
      )
      .maybeSingle();
  };

export const getBattleResultDetails =
  async battleId => {

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_battle_result_details",

      {
        p_battle_id:
          battleId,
      }
    );

    return {
      data,
      error,
    };
  };

export async function claimBonusTreasure(
  battleId,
  treasureId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "claim_bonus_treasure",
    {
      p_battle_id: battleId,
      p_treasure_id: treasureId,
    }
  );

  if (error) {
    console.error(
      "CLAIM BONUS TREASURE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playPlayerPetrer(
  gameId,
  cardId,
  discardCardIds = []
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "play_player_petrer",
    {
      p_game_id: gameId,

      p_card_id: cardId,

      p_discard_card_ids:
        discardCardIds,
    }
  );


  if (error) {

    console.error(
      "RISKY DILEMMA ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }


  return {
    result: data,
    error: null,
  };
}

export async function playBat(
  gameId,
  cardId,
  targetTreasureId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "play_bat",
    {
      p_game_id:
        gameId,

      p_card_id:
        cardId,

      p_target_treasure_id:
        targetTreasureId,
    }
  );


  if (error) {

    console.error(
      "BAT ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }


  return {
    result: data,
    error: null,
  };
}


// Добавь/замени эту функцию в gameService.js

export async function startGroupOpenBattle(
  gameId,
  attackCardId,
  targetTreasureId,
  supportCardIds = []
) {
  const { data, error } = await supabase.rpc(
    "start_group_open_battle",
    {
      p_game_id: gameId,
      p_attack_card_id: attackCardId,
      p_target_treasure_id: targetTreasureId,
      p_support_card_ids: supportCardIds,
    }
  );

  if (error) {
    console.error(
      "GROUP OPEN BATTLE ERROR:",
      error
    );

    return {
      battleId: null,
      error,
    };
  }

  return {
    battleId: data,
    error: null,
  };
}

export async function playVilencia(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_vilencia",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "VILENCIA ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function startChicken(
  gameId,
  cardId,
  targetPlayerId
) {
  const { data, error } = await supabase.rpc(
    "start_chicken",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_target_player_id: targetPlayerId,
    }
  );

  if (error) {
    console.error(
      "START CHICKEN ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function getActiveChicken(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_chicken",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE CHICKEN ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}


export async function resolveChicken(
  gameId,
  slots
) {
  const { data, error } = await supabase.rpc(
    "resolve_chicken",
    {
      p_game_id: gameId,
      p_slots: slots,
    }
  );

  if (error) {
    console.error(
      "RESOLVE CHICKEN ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function startElf(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "start_elf",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "START ELF ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function getActiveElf(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_elf",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE ELF ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}


export async function resolveElf(
  gameId,
  selectedCardId
) {
  const { data, error } = await supabase.rpc(
    "resolve_elf",
    {
      p_game_id: gameId,
      p_selected_card_id: selectedCardId,
    }
  );

  if (error) {
    console.error(
      "RESOLVE ELF ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function getElixirOptions(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_elixir_options",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ELIXIR OPTIONS ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}


export async function playElixir(
  gameId,
  cardId,
  targetCardId
) {
  const { data, error } = await supabase.rpc(
    "play_elixir",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_target_card_id: targetCardId,
    }
  );

  if (error) {
    console.error(
      "PLAY ELIXIR ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function beginEnergyAction(
  gameId,
  cardId,
  payload = {}
) {
  const { data, error } = await supabase.rpc(
    "begin_energy_action",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_payload: payload,
    }
  );

  if (error) {
    console.error(
      "BEGIN ENERGY ACTION ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function getActiveEnergyReaction(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_energy_reaction",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE ENERGY REACTION ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}


export async function passEnergyReaction(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "pass_energy_reaction",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "PASS ENERGY REACTION ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function playUltraprotection(
  gameId,
  cardId,
  discardCardIds
) {
  const { data, error } = await supabase.rpc(
    "play_ultraprotection",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_discard_card_ids:
        discardCardIds ?? [],
    }
  );

  if (error) {
    console.error(
      "PLAY ULTRAPROTECTION ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function getActiveBattleReaction(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_battle_reaction",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE BATTLE REACTION ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}


export async function passBattleReaction(
  battleId
) {
  const { data, error } = await supabase.rpc(
    "pass_battle_reaction",
    {
      p_battle_id: battleId,
    }
  );

  if (error) {
    console.error(
      "PASS BATTLE REACTION ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function playChatter(
  battleId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_chatter",
    {
      p_battle_id: battleId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY CHATTER ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function finalizeBattleReactions(
  battleId
) {
  const { data, error } = await supabase.rpc(
    "finalize_battle_reactions",
    {
      p_battle_id: battleId,
    }
  );

  if (error) {
    console.error(
      "FINALIZE BATTLE REACTIONS ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playProtection(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_protection",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY PROTECTION ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playRice(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_rice",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY RICE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playSpy(
  gameId,
  battleId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_spy",
    {
      p_game_id: gameId,
      p_battle_id: battleId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY SPY ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function getActiveSpyReveal(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_spy_reveal",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE SPY REVEAL ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function playSquib(
  gameId,
  battleId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_squib",
    {
      p_game_id: gameId,
      p_battle_id: battleId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY SQUIB ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function passSquib(
  gameId,
  battleId
) {
  const { data, error } = await supabase.rpc(
    "pass_squib",
    {
      p_game_id: gameId,
      p_battle_id: battleId,
    }
  );

  if (error) {
    console.error(
      "PASS SQUIB ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

// ============================================================
// FORTRESS — ОБОРОННА ФОРТЕЦЯ
// ============================================================

export async function playFortress(
  gameId,
  cardId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "play_fortress",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY FORTRESS ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function getActiveFortresses(
  gameId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_active_fortresses",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE FORTRESSES ERROR:",
      error
    );

    return {
      data: [],
      error,
    };
  }

  return {
    data: Array.isArray(data)
      ? data
      : [],
    error: null,
  };
}

// ============================================================
// MAJOR FLOOD — ВЕЛИКА ПОВІНЬ
// ============================================================

export async function playMajorFlood(
  gameId,
  cardId
) {

  const { data, error } =
    await supabase.rpc(
      "play_major_flood",
      {
        p_game_id: gameId,
        p_card_id: cardId,
      }
    );


  if (error) {

    console.error(
      "PLAY MAJOR FLOOD ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }


  return {
    result: data,
    error: null,
  };
}

// ============================================================
// STATUE — ВЕЛИЧЕЗНА СТАТУЯ
// ============================================================

export async function playStatue(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_statue",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY STATUE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function getActiveStatues(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_statues",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE STATUES ERROR:",
      error
    );

    return {
      data: [],
      error,
    };
  }

  return {
    data: Array.isArray(data)
      ? data
      : [],
    error: null,
  };
}


export async function getActiveBattleGuardChoice(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_active_battle_guard_choice",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET ACTIVE BATTLE GUARD CHOICE ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}


export async function chooseBattleGuard(
  battleId,
  guardCardId
) {
  const { data, error } = await supabase.rpc(
    "choose_battle_guard",
    {
      p_battle_id: battleId,
      p_guard_card_id: guardCardId,
    }
  );

  if (error) {
    console.error(
      "CHOOSE BATTLE GUARD ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playTrouble(
  gameId,
  troubleCardId,
  targetTreasureId,
  attackCardId,
  supportCardIds = []
) {
  const { data, error } = await supabase.rpc(
    "play_trouble",
    {
      p_game_id: gameId,
      p_card_id: troubleCardId,
      p_target_treasure_id: targetTreasureId,
      p_attack_card_id: attackCardId,
      p_support_card_ids: supportCardIds,
    }
  );

  if (error) {
    console.error(
      "PLAY TROUBLE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playSilkTrade(
  gameId,
  cardId,
  myTreasureIds,
  targetTreasureIds
) {
  const { data, error } = await supabase.rpc(
    "play_silk_trade",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_my_treasure_ids: myTreasureIds,
      p_target_treasure_ids: targetTreasureIds,
    }
  );

  if (error) {
    console.error(
      "PLAY SILK TRADE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playDoubleAction(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "play_double_action",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PLAY DOUBLE ACTION ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function getTurnActionState(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_turn_action_state",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET TURN ACTION STATE ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function playWinds(
  gameId,
  cardId,
  myTreasureId,
  targetTreasureId
) {
  const { data, error } = await supabase.rpc(
    "play_winds",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_my_treasure_id: myTreasureId,
      p_target_treasure_id: targetTreasureId,
    }
  );

  if (error) {
    console.error(
      "PLAY WINDS ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

export async function playPactDevil(
  gameId,
  cardId,
  targetPlayerId
) {
  const { data, error } = await supabase.rpc(
    "play_pact_devil",
    {
      p_game_id: gameId,
      p_card_id: cardId,
      p_target_player_id: targetPlayerId,
    }
  );

  if (error) {
    console.error(
      "PLAY PACT DEVIL ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

// ============================================================
// EFFECTIVE INGREDIENT COUNT
// ============================================================

export async function getEffectiveIngredientCount(
  gameId
) {
  const { data, error } = await supabase.rpc(
    "get_my_effective_ingredient_count",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET EFFECTIVE INGREDIENT COUNT ERROR:",
      error
    );

    return {
      count: 0,
      error,
    };
  }

  return {
    count: Number(data ?? 0),
    error: null,
  };
}

export async function playTemporaryTreasure(
  gameId,
  cardId
) {
  const { data, error } = await supabase.rpc(
    "use_temporary_treasure",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "USE TEMPORARY TREASURE ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}

// ============================================================
// ACTIVE GAME EXIT
// ============================================================

export async function getRoomInfo(roomId) {
  return await supabase
    .from("rooms")
    .select(`
      id,
      host_id,
      status
    `)
    .eq("id", roomId)
    .single();
}


export async function leaveActiveGame(gameId) {
  const { data, error } = await supabase.rpc(
    "leave_active_game",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "LEAVE ACTIVE GAME ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}


export async function endActiveGame(gameId) {
  const { data, error } = await supabase.rpc(
    "end_active_game",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "END ACTIVE GAME ERROR:",
      error
    );

    return {
      result: null,
      error,
    };
  }

  return {
    result: data,
    error: null,
  };
}