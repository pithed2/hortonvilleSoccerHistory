export type RedRoomAccessPlayer = {
  accountType: string
  publicTag: string
}

export const RED_ROOM_SUPER_ADMIN_TAG = "COACH-ANDY"

export function isPrivateRedRoomPlayer(player: RedRoomAccessPlayer) {
  return player.accountType === "private"
}

export function canSeeRedRoomPlayer(viewer: RedRoomAccessPlayer, target: RedRoomAccessPlayer) {
  if (viewer.publicTag === RED_ROOM_SUPER_ADMIN_TAG) return true
  if (isPrivateRedRoomPlayer(viewer)) {
    return target.publicTag === RED_ROOM_SUPER_ADMIN_TAG || isPrivateRedRoomPlayer(target) || target.accountType === "legend"
  }
  return !isPrivateRedRoomPlayer(target)
}

export function canChallengeRedRoomPlayer(viewer: RedRoomAccessPlayer, target: RedRoomAccessPlayer) {
  return viewer.publicTag !== target.publicTag && canSeeRedRoomPlayer(viewer, target)
}

export function isPrivateRedRoomMatch(first: RedRoomAccessPlayer, second: RedRoomAccessPlayer) {
  return isPrivateRedRoomPlayer(first) || isPrivateRedRoomPlayer(second)
}
