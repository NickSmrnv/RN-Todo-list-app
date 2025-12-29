import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:3000/",
        prepareHeaders(headers, { getState }) {
            return headers
        },
    }),
    endpoints: () => ({})
})




