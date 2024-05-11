import { addHours, addMinutes, format, startOfDecade } from "date-fns";
import prisma from "../../utils/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { TFilterRequest, TSchedule } from "./schedule.interface";
import { TAuthUser, TGenericResponse, TPaginationOptions } from "../../interface/interface";
import { paginationHelpers } from "../../utils/paginationHelper";

const convertDateTime = async (date: Date) => {
  const offset =
    date.getTimezoneOffset() *
    60000; /** getTimezoneOffset returns timedifference 
with utc and local time in minuites , 60000 is in miliseconds of 1 miniute. Final result will be timedifference in miliseconds**/
  return new Date(date.getTime() + offset);
};

const createScheduleIntoDB = async (
  payload: TSchedule
): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;
  const intervalTime = 30;
  const schedules = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currentDate <= lastDate) {
    //adding times with date
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    while (startDateTime < endDateTime) {
      //

      // const scheduleData = {
      //   startDateTime: startDateTime,
      //   endDateTime: addMinutes(startDateTime, intervalTime),
      // }
      const startDateTimeUTC = await convertDateTime(startDateTime)
      const endDateTimeUTC = await  convertDateTime(addMinutes(startDateTime, intervalTime))
      const scheduleData = {
        startDateTime:startDateTimeUTC,
        endDateTime:endDateTimeUTC,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

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


const getAllScheduleFromDB = async (
  filters: TFilterRequest,
  options: TPaginationOptions,
  user: any
): Promise<TGenericResponse<Schedule[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { startDateTime, endDateTime, ...filterData } = filters; // Extracting startDate and endDate from filters

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
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};


  const doctorsSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email
      }
    }
  });

  const doctorScheduleIds = new Set(doctorsSchedules.map(schedule => schedule.scheduleId));

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: [...doctorScheduleIds]
      }
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
          createdAt: 'desc',
        },
  });
  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: [...doctorScheduleIds]
      }
    }
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getScheduleByIdFromDB = async (id: string): Promise<Schedule | null> => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const deleteScheduleFromDB = async (id: string): Promise<Schedule> => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ScheduleService = {
  createScheduleIntoDB,
  getAllScheduleFromDB,
  getScheduleByIdFromDB,
  deleteScheduleFromDB,
};
