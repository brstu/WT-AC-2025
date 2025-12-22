"use client"

import Appbar from "@/components/Appbar/Appbar"
import { Jobs } from "@/components/jobpage" 

export default function dashboard(){
    return <div>
        <Appbar/>
        <div>
        <Jobs/>
        </div>
        
    </div>
}