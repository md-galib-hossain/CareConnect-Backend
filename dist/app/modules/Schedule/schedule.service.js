"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const paginationHelper_1 = require("../../utils/paginationHelper");
const convertDateTime = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = date.getTimezoneOffset() *
        60000; /** getTimezoneOffset returns timedifference
with utc and local time in minuites , 60000 is in miliseconds of 1 miniute. Final result will be timedifference in miliseconds**/
    return new Date(date.getTime() + offset);
});
const createScheduleIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate, startTime, endTime } = payload;
    const intervalTime = 30;
    const schedules = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
        //adding times with date
        const startDateTime = new Date((0, date_fns_1.addMinutes)((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])), Number(startTime.split(":")[1])));
        const endDateTime = new Date((0, date_fns_1.addMinutes)((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])), Number(endTime.split(":")[1])));
        while (startDateTime < endDateTime) {
            //
            // const scheduleData = {
            //   startDateTime: startDateTime,
            //   endDateTime: addMinutes(startDateTime, intervalTime),
            // }
            const startDateTimeUTC = yield convertDateTime(startDateTime);
            const endDateTimeUTC = yield convertDateTime((0, date_fns_1.addMinutes)(startDateTime, intervalTime));
            const scheduleData = {
                startDateTime: startDateTimeUTC,
                endDateTime: endDateTimeUTC,
            };
            const existingSchedule = yield prisma_1.default.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime,
                },
            });
            if (!existingSchedule) {
                const result = yield prisma_1.default.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
            }
            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
});
//old
// const getAllScheduleFromDB = async (
//   filters: TFilterRequest,
//   options: TPaginationOptions,
//   user: TAuthUser
// ) => {
//   const { limit, page, skip } = paginationHelpers.calculatePagination(options);
//   const { startDateTime, endDateTime, ...filterData } = filters;
//   const andConditions = [];
//   if (startDateTime && endDateTime) {
//     andConditions.push({
//       AND: [
//         {
//           startDateTime: {
//             gte: startDateTime,
//           },
//         },
//         {
//           endDateTime: {
//             lte: endDateTime,
//           },
//         },
//       ],
//     });
//   }
//   if (Object.keys(filterData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filterData).map((key) => {
//         return {
//           [key]: {
//             equals: (filterData as any)[key],
//           },
//         };
//       }),
//     });
//   }
//   const whereConditions: Prisma.ScheduleWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};
//   const doctorSchedules = await prisma.doctorSchedules.findMany({
//     where: {
//       doctor: {
//         email: user?.email,
//       },
//     },
//   });
//   const doctorScheduleIds = doctorSchedules.map(
//     (schedule) => schedule.scheduleId
//   );
//   console.log(doctorScheduleIds);
//   const result = await prisma.schedule.findMany({
//     where: {
//       ...whereConditions,
//       id: {
//         notIn: doctorScheduleIds,
//       },
//     },
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : {
//             createdAt: "desc",
//           },
//   });
//   const total = await prisma.schedule.count({
//     where: {
//       ...whereConditions,
//       id: {
//         notIn: doctorScheduleIds,
//       },
//     },
//   });
//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };
// const getScheduleByIdFromDB = async (id: string): Promise<Schedule | null> => {
//   const result = await prisma.schedule.findUnique({
//     where: {
//       id,
//     },
//   });
//   return result;
// };
const getAllScheduleFromDB = (filters, options, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { startDateTime, endDateTime } = filters, filterData = __rest(filters, ["startDateTime", "endDateTime"]); // Extracting startDate and endDate from filters
    const andConditions = [];
    // Adding date filtering conditions if startDate and endDate are provided
    if (startDateTime && endDateTime) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: startDateTime, // Greater than or equal to startDate
                    },
                },
                {
                    endDateTime: {
                        lte: endDateTime, // Less than or equal to endDate
                    },
                },
            ],
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                return {
                    [key]: {
                        equals: filterData[key],
                    },
                };
            }),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const doctorsSchedules = yield prisma_1.default.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user.email
            }
        }
    });
    const doctorScheduleIds = new Set(doctorsSchedules.map(schedule => schedule.scheduleId));
    const result = yield prisma_1.default.schedule.findMany({
        where: Object.assign(Object.assign({}, whereConditions), { id: {
                notIn: [...doctorScheduleIds]
            } }),
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
    });
    const total = yield prisma_1.default.schedule.count({
        where: Object.assign(Object.assign({}, whereConditions), { id: {
                notIn: [...doctorScheduleIds]
            } })
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getScheduleByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.findUnique({
        where: {
            id,
        },
    });
    return result;
});
const deleteScheduleFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.ScheduleService = {
    createScheduleIntoDB,
    getAllScheduleFromDB,
    getScheduleByIdFromDB,
    deleteScheduleFromDB,
};
