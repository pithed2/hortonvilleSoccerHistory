export type RedRoomTaunt = { id: string; label: string; ownerTag?: string }

export const RED_ROOM_TAUNTS: readonly RedRoomTaunt[] = [
  { id: "pressure", label: "Hope you like pressure." },
  { id: "guess", label: "Pick a corner. Any corner." },
  { id: "ice", label: "Cold enough in here?" },
  { id: "called_corner", label: "I can tell you the corner if that helps." },
  { id: "wrong_way", label: "You’re leaning the wrong way already." },
  { id: "final_answer", label: "That’s your final answer?" },
  { id: "replay_ready", label: "The replay button is going to love this." },
  { id: "net_missed_me", label: "The net says it missed me." },
  { id: "five_shots", label: "Five shots. Try to keep up." },
  { id: "best_guess", label: "Save your best guess for last." },
  { id: "pathetic", label: "Truly pathetic." },
  { id: "seriously", label: "Seriously. That’s what you’re bringing?" },
  { id: "andy_316", label: "Coach Andy 3.16 says I just whooped your butt!", ownerTag: "COACH-ANDY" },
  { id: "change_question", label: "You think you know, but I change the question." },
  { id: "flash_photography", label: "For the benefit of those with flash photography, I’ll just stand here for a moment." },
  { id: "whos_next", label: "Who’s Next?" },
  { id: "never_forget", label: "You will never forget the day you challenged {{username}}." },
  { id: "mania", label: "What you gonna do when {{username}}-mania runs wild on you?" },
]

export const RED_ROOM_VICTORY_CELEBRATIONS = [
  { id: "ice", label: "Ice in the Veins", action: "Cross the arms and let the frost hit.", mark: "❄", yell: "ICE COLD." },
  { id: "fist", label: "Old-School Wheel Away", action: "One fist up. Full sprint. Job done.", mark: "✊", yell: "JOB DONE." },
  { id: "slide", label: "Knee Slide", action: "The classic slide toward the corner.", mark: "⚡", yell: "BACK OF THE NET." },
  { id: "camera", label: "Corner-Flag Camera", action: "Frame the replay and snap the picture.", mark: "▣", yell: "RUN THAT BACK." },
  { id: "calm", label: "Calm Down", action: "Palms down. Everything is under control.", mark: "〰", yell: "ALL UNDER CONTROL." },
  { id: "statue", label: "The Statue", action: "Freeze in the pose and make them wait.", mark: "♜", yell: "PICTURE PERFECT." },
  { id: "guitar", label: "Air Guitar", action: "Hit the riff like the goal was the chorus.", mark: "♬", yell: "PLAY THE HIT." },
  { id: "layup", label: "Nothing but Net", action: "Dribble the invisible ball and finish the layup.", mark: "●", yell: "NOTHING BUT NET." },
  { id: "team_photo", label: "Team Photo", action: "Drop to a knee and pose for the group chat.", mark: "◎", yell: "SAY GOAL." },
  { id: "polar_roar", label: "Polar Bear Roar", action: "Claws out. Roar toward the Red Room.", mark: "🐻‍❄️", yell: "WELCOME TO THE DEN." },
  { id: "akin_bell", label: "Akin Field — Ring the Bell", action: "Ring the Akin Field bell after an important home win.", mark: "🔔", yell: "RING THE BELL." },
] as const

export const RED_ROOM_VICTORY_YELLS = [
  { id: "cold", label: "ICE COLD." },
  { id: "wall", label: "THE WALL HOLDS." },
  { id: "net", label: "BACK OF THE NET." },
  { id: "ring_bell", label: "RING THE BELL!" },
  { id: "whos_next", label: "WHO’S NEXT?" },
  { id: "game_over", label: "THAT’S GAME." },
  { id: "lights_out", label: "LIGHTS OUT." },
  { id: "red_room", label: "WELCOME TO THE RED ROOM." },
  { id: "run_replay", label: "RUN THE REPLAY." },
  { id: "scoreboard", label: "CHECK THE SCOREBOARD." },
  { id: "never_doubt", label: "NEVER IN DOUBT." },
  { id: "built_for_this", label: "BUILT FOR THIS." },
  { id: "pressure", label: "PRESSURE? WHAT PRESSURE?" },
  { id: "wrong_challenge", label: "YOU PICKED THE WRONG CHALLENGE." },
  { id: "den_closed", label: "THE DEN IS CLOSED." },
  { id: "group_chat", label: "THAT ONE’S GOING IN THE GROUP CHAT." },
  { id: "archives", label: "PUT IT IN THE ARCHIVES." },
  { id: "goodnight", label: "SAY GOODNIGHT." },
  { id: "five_lessons", label: "FIVE SHOTS. FIVE LESSONS." },
  { id: "top_bins", label: "TOP BINS. GOOD NIGHT." },
  { id: "no_chance", label: "YOU NEVER HAD A CHANCE." },
  { id: "lesson_over", label: "LESSON OVER." },
  { id: "polar_bears", label: "GAME. SET. POLAR BEARS." },
] as const

export function tauntLabel(id: string, username?: string) {
  const label = RED_ROOM_TAUNTS.find((taunt) => taunt.id === id)?.label ?? RED_ROOM_TAUNTS[0].label
  return label.replaceAll("{{username}}", username || "me")
}

export function victoryCelebration(id: string) {
  return RED_ROOM_VICTORY_CELEBRATIONS.find((celebration) => celebration.id === id) ?? RED_ROOM_VICTORY_CELEBRATIONS[0]
}

export function victoryYell(id: string) {
  return RED_ROOM_VICTORY_YELLS.find((victory) => victory.id === id)?.label ?? RED_ROOM_VICTORY_YELLS[0].label
}
