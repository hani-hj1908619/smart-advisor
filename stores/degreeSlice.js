const apiData = "http://localhost:3000/api/degree"


export const degreeSlice = (set) => ({
    savePlan: false,
    courseToAdd: null,
    maxMajorCourse: 2,
    preferedCourseTiming: 'morning',
    preferences: { Degree: null, maxCh: 12, maxMajorCourses: 2, language: 'en', timing: 'morning' },
    isDropped: false,
    generatedPlan: [],
    setSavedPlan: () => set((state) => ({ savePlan: !state.savePlan })),
    setGeneratedPlan: (data) => set((state) => ({ preferences: { ...state, generatedPlan: data } })),
    setIsDropped: () => set((state) => ({ isDropped: !state.isDropped })),
    setCourseToAdd: (data) => set({ courseToAdd: data }),
    //updateMaxMajorCourse: (data) => set({maxMajorCourse: data}),
    //setCourseTiming: (data) => set({preferedCourseTiming: data}),
    updateLanguage: (data) => set((state) => ({ preferences: { ...state, language: data } })),
    updateCourseTiming: (data) => set((state) => ({ preferences: { ...state, timing: data } })),
    updateMaxCh: (data) => set((state) => ({ preferences: { ...state, maxCh: data } })),
    updateMaxMajorCourses: (data) => set((state) => ({ preferences: { ...state, maxMajorCourses: data } })),

    //    updateAction: (data) => {
    //        set({action: data})
    //    },
    //
    //    storeDegrees: (data) => {
    //        set({ degree: data })
    //    },
    //
    //    addDegrees: (data) => {
    //        set({ degree: data })
    //    },
    //
    //    updateDegrees: (data) => {
    //        set({ degree: data })
    //    },
    //
    //    deleteDegrees: (data) => {
    //        set({ degree: data })
    //    },


    /**
     * could be used to fetch manually if needed - to excuete this code.
     * Make sure to call it in OnClick{fetch}
     * OR
     * call it in fetch(<functionName> here its fetch) to automatically exceute based on a condition.
     */
    fetch: async () => {
        const res = await fetch(apiData)
        set({ degree: await res.json() })
    },

})