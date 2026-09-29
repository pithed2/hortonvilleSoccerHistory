export const RED_ROOM_TAUNTS = [
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
] as const

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
] as const

export const RED_ROOM_VICTORY_YELLS = [
  { id: "cold", label: "ICE COLD." },
  { id: "wall", label: "THE WALL HOLDS." },
  { id: "net", label: "BACK OF THE NET." },
] as const

export function tauntLabel(id: string) {
  return RED_ROOM_TAUNTS.find((taunt) => taunt.id === id)?.label ?? RED_ROOM_TAUNTS[0].label
}

export function victoryCelebration(id: string) {
  return RED_ROOM_VICTORY_CELEBRATIONS.find((celebration) => celebration.id === id) ?? RED_ROOM_VICTORY_CELEBRATIONS[0]
}

export function victoryYell(id: string) {
  return RED_ROOM_VICTORY_YELLS.find((victory) => victory.id === id)?.label ?? RED_ROOM_VICTORY_YELLS[0].label
}
