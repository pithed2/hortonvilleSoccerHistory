"use client"
import {useState} from 'react'
import {Replay} from '@/components/red-room/red-room-app'
const me={id:'a',displayName:'Local test player',publicTag:'TEST',rating:1000,squads:[],accountType:'player' as const,isBot:false,specialAbility:null,specialAbilityLabel:null}
const replay=Array.from({length:10},(_,i)=>({shooterId:i%2?'b':'a',keeperId:i%2?'a':'b',shot:i%9+1,covered:[2,4],goal:i%2===0}))
const challenge={id:'test',code:'TEST',status:'completed',challengerId:'a',opponentId:'b',challengerName:'Local test player',opponentName:'Local test keeper',challengerTauntId:'replay_ready',opponentTauntId:'pressure',challengerVictoryId:'ring_bell',opponentVictoryId:'wall',challengerCelebrationId:'akin_bell',opponentCelebrationId:'ice',challengerScore:5,opponentScore:0,replay,isMineToAnswer:false}
export default function Check(){const [open,setOpen]=useState(false); return <main><h1>Temporary local animation verification</h1><button onClick={()=>setOpen(true)}>Open replay</button>{open?<Replay challenge={challenge} me={me} onClose={()=>setOpen(false)}/>:null}</main>}
