import { supabase } from "./supabase";

const generateRoomCode = () => {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters[
      Math.floor(
        Math.random() * characters.length
      )
    ];
  }

  return code;
};

export const createRoom = async (userId) => {
  const code = generateRoomCode();

  const { data: room, error: roomError } =
    await supabase
      .from("rooms")
      .insert({
        code,
        host_id: userId,
        status: "waiting",
      })
      .select()
      .single();

  if (roomError) {
    return {
      room: null,
      error: roomError,
    };
  }

  const { error: playerError } =
    await supabase
      .from("room_players")
      .insert({
        room_id: room.id,
        player_id: userId,
      });

  if (playerError) {
    return {
      room: null,
      error: playerError,
    };
  }

  return {
    room,
    error: null,
  };
};

export const getRoom = async (roomId) => {
  return await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();
};

export const getRoomPlayers = async (roomId) => {
  const {
    data,
    error,
  } = await supabase
    .from("room_players")
    .select(`
            id,
            player_id,
            profiles (
                id,
                nickname,
                avatar
            )
        `)
    .eq("room_id", roomId);

  return {
    data,
    error,
  };
};

export const getRoomByCode = async (code) => {
  return await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .maybeSingle();
};

export const joinRoom = async (userId, code) => {
  const normalizedCode =
    code.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      room: null,
      error: {
        message: "Введіть код кімнати",
      },
    };
  }

  // Ищем комнату
  const {
    data: room,
    error: roomError,
  } = await getRoomByCode(normalizedCode);

  if (roomError) {
    return {
      room: null,
      error: roomError,
    };
  }

  if (!room) {
    return {
      room: null,
      error: {
        message: "Кімната не знайдена",
      },
    };
  }

  // Проверяем состояние комнаты
  if (room.status !== "waiting") {
    return {
      room: null,
      error: {
        message: "Гра вже почалась",
      },
    };
  }

  // Проверяем, находится ли игрок уже в комнате
  const {
    data: existingPlayer,
    error: existingError,
  } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", room.id)
    .eq("player_id", userId)
    .maybeSingle();

  if (existingError) {
    return {
      room: null,
      error: existingError,
    };
  }

  if (existingPlayer) {
    return {
      room,
      error: null,
    };
  }

  // Считаем игроков
  const {
    count,
    error: countError,
  } = await supabase
    .from("room_players")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("room_id", room.id);

  if (countError) {
    return {
      room: null,
      error: countError,
    };
  }

  if (count >= 5) {
    return {
      room: null,
      error: {
        message: "Кімната заповнена!",
      },
    };
  }

  // Добавляем игрока
  const { error: joinError } =
    await supabase
      .from("room_players")
      .insert({
        room_id: room.id,
        player_id: userId,
      });

  if (joinError) {
    return {
      room: null,
      error: joinError,
    };
  }

  return {
    room,
    error: null,
  };
};

export const leaveRoom = async (roomId, userId) => {
  const { error } = await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("player_id", userId);

  return {
    error,
  };
};

export const closeRoom = async (roomId) => {
  const {
    data,
    error,
  } = await supabase
    .from("rooms")
    .update({
      status: "closed",
    })
    .eq("id", roomId)
    .select()
    .single();

  return {
    room: data,
    error,
  };
};

export const isPlayerInRoom = async (
  roomId,
  userId
) => {
  const {
    data,
    error,
  } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId)
    .eq("player_id", userId)
    .maybeSingle();

  return {
    isMember: Boolean(data),
    error,
  };
};

export const startGame = async (roomId) => {
  const {
    data,
    error,
  } = await supabase.rpc(
    "start_game",
    {
      p_room_id: roomId,
    }
  );

  return {
    gameId: data,
    error,
  };
};