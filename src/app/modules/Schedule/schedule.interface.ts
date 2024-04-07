export type TSchedule= {
    startDate : string;
    endDate : string;
    startTime : string;
    endTime : string;
}
export type TFilterRequest = {
    startDateTime?: string | undefined;
    endDateTime?: string | undefined;
}