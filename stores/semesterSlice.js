const apiData = "http://localhost:3000/api/degree"


export const semesterSlice = (set) => ({
    editMode: false,
    setEditMode: () => set((state) => ({editMode: !state.editMode})),

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
        set({degree: await res.json()})
    },

})