import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import { TAuthUser, TPaginationOptions } from "../../interface/interface"
import { paginationHelpers } from "../../utils/paginationHelper"
import prisma from "../../utils/prisma"
import { TDoctorScheduleFilterRequest } from "./doctorSchedule.interface"
import { Prisma } from "@prisma/client"

const createDoctorScheduleIntoDB =async(user: any, payload: {scheduleIds : string[]})=>{

const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
        email : user.email
    }
})

const doctorScheduleData = payload.scheduleIds.map(scheduleId=> ({
   
        doctorId : doctorData?.id,
        scheduleId 
  
} ))
const result = await prisma.doctorSchedules.createMany({
    data : doctorScheduleData
})
return result
}

const getMySchedule = async (
    filters: TDoctorScheduleFilterRequest,
    options: TPaginationOptions,
    user: TAuthUser,
  ) => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { startDateTime, endDateTime, ...filterData } = filters;
  
    const whereConditions: Prisma.DoctorSchedulesWhereInput = {
      doctor: {
        email: user?.email,
      },
      ...(startDateTime && endDateTime
        ? {
            schedule: {
              startDateTime: {
                gte: new Date(startDateTime),
              },
              endDateTime: {
                lte: new Date(endDateTime),
              },
            },
          }
        : {}),
      ...(Object.keys(filterData).length > 0
        ? {
            AND: Object.keys(filterData).map(key => ({
              [key]: {
                equals: (filterData as any)[key],
              },
            })),
          }
        : {}),
    };
  
    const doctorSchedules = await prisma.doctorSchedules.findMany({
      where: whereConditions,
      include: {
        doctor: true,
        schedule: true,
        appointment: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  
    return {
      meta: {
        total: doctorSchedules.length,
        page,
        limit,
      },
      data: doctorSchedules,
    };
  };
  

const deleteDoctorScheduleFromDB = async (user: TAuthUser, scheduleId: string) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const isBookedSchedule = await prisma.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId: scheduleId,
            isBooked: true
        }
    });

    if (isBookedSchedule) {
        throw new AppError(httpStatus.BAD_REQUEST, "You can not delete the schedule because of the schedule is already booked!")
    }

    const result = await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleId
            }
        }
    })
    return result;

}

const getAllDoctorScheduleFromDB = async (
    filters: TDoctorScheduleFilterRequest,
    options: TPaginationOptions,
  ) => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, startDateTime, endDateTime, ...filterData } = filters;
    const andConditions = [];
  
    if (searchTerm) {
      andConditions.push({
        doctor: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      });
    }
  
    if (startDateTime && endDateTime) {
      andConditions.push({
        schedule: {
          AND: [
            {
              startDateTime: {
                gte: startDateTime,
              },
            },
            {
              startDateTime: {
                lte: endDateTime,
              },
            },
          ],
        },
      });
    }
  
    if (Object.keys(filterData).length > 0) {
      if (
        typeof filterData.isBooked === 'string' &&
        filterData.isBooked === 'true'
      ) {
        filterData.isBooked = true;
      } else if (
        typeof filterData.isBooked === 'string' &&
        filterData.isBooked === 'false'
      ) {
        filterData.isBooked = false;
      }
      andConditions.push({
        AND: Object.keys(filterData).map(key => ({
          [key]: {
            equals: (filterData as any)[key],
          },
        })),
      });
    }
  
    const whereConditions: any =
      andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.doctorSchedules.findMany({
      include: {
        doctor: true,
        schedule: true,
      },
      where: whereConditions,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : {
              createdAt: 'desc',
            },
    });
    const total = await prisma.doctorSchedules.count({
      where: whereConditions,
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

export const DoctorScheduleService = {createDoctorScheduleIntoDB,getMySchedule,deleteDoctorScheduleFromDB,getAllDoctorScheduleFromDB}