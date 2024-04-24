import {create} from 'zustand'
//import {persist} from "zustand/middleware"
import { degreeSlice } from './degreeSlice'
import {semesterSlice} from "./semesterSlice";


export const useStore = create((set) => ({
    ...degreeSlice(set),
    ...semesterSlice(set)
}))