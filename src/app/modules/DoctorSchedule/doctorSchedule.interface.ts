export type TDoctorScheduleFilterRequest = {
    searchTerm?: string | undefined;
    isBooked?: boolean | undefined;
    endDateTime? : string | undefined;
    startDateTime? : string | undefined
};