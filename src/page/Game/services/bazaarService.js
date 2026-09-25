import {
  supabase,
} from "../../../services/supabase";


export async function startBazaar(
  gameId,
  cardId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "start_bazaar",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "START BAZAAR ERROR:",
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


export async function pickBazaarCard(
  gameId,
  cardId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "pick_bazaar_card",
    {
      p_game_id: gameId,
      p_card_id: cardId,
    }
  );

  if (error) {
    console.error(
      "PICK BAZAAR ERROR:",
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


export async function getActiveBazaar(
  gameId
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_active_bazaar",
    {
      p_game_id: gameId,
    }
  );

  if (error) {
    console.error(
      "GET BAZAAR ERROR:",
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
