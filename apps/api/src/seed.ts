import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Faculty } from './faculties/entities/faculty.entity';
import { Department } from './departments/entities/department.entity';
import { User } from './users/entities/user.entity';
import { Profile, ProfileType } from './profiles/entities/profile.entity';
import { Course } from './courses/entities/course.entity';
import { Semester } from './courses/entities/semester.entity';
import { CourseOffering } from './courses/entities/course-offering.entity';
import { Enrollment, EnrollmentStatus } from './courses/entities/enrollment.entity';
import { Notification, NotificationType } from './notifications/notification.entity';
import { TimeSlot, DayOfWeek } from './courses/entities/time-slot.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const facultyRepo = app.get(getRepositoryToken(Faculty));
    const deptRepo = app.get(getRepositoryToken(Department));
    const userRepo = app.get(getRepositoryToken(User));
    const profileRepo = app.get(getRepositoryToken(Profile));

    console.log('Seeding data...');

    // 1. Create Faculty
    let faculty = await facultyRepo.findOne({ where: { code: 'ENG' } });
    if (!faculty) {
        faculty = facultyRepo.create({
            name: 'Faculty of Engineering',
            code: 'ENG',
        });
        await facultyRepo.save(faculty);
        console.log('Created Faculty: ENG');
    }

    // 2. Create Department
    let dept = await deptRepo.findOne({ where: { code: 'CS', facultyId: faculty.id } });
    if (!dept) {
        dept = deptRepo.create({
            name: 'Computer Science',
            code: 'CS',
            faculty: faculty,
            facultyId: faculty.id
        });
        await deptRepo.save(dept);
        console.log('Created Department: CS');
    }

    // 3. Create Super Admin User
    const email = 'admin@university.edu';
    let adminUser = await userRepo.findOne({ where: { email } });
    if (!adminUser) {
        adminUser = userRepo.create({
            email,
            passwordHash: bcrypt.hashSync('admin123', 10),
            isSuperAdmin: true,
        });
        await userRepo.save(adminUser);
        console.log('Created Super Admin');
    }

    // 4. Create Teacher (Professor)
    const teacherEmail = 'prof.smith@university.edu';
    let teacherUser = await userRepo.findOne({ where: { email: teacherEmail } });

    if (!teacherUser) {
        teacherUser = userRepo.create({
            email: teacherEmail,
            passwordHash: bcrypt.hashSync('secret', 10),
            isSuperAdmin: false
        });
        await userRepo.save(teacherUser);

        // Create Profile
        const teacherProfile = profileRepo.create({
            user: teacherUser,
            faculty: faculty,
            department: dept,
            type: ProfileType.TEACHER,
            designation: 'Senior Professor',
            code: 'EMP-001',
            metadata: { specialization: 'AI & Robotics' }
        });
        await profileRepo.save(teacherProfile);
        console.log('Created Teacher: Prof. Smith');
    }

    // 5. Create Student 1
    const studentEmail = 'student1@university.edu';
    let studentUser = await userRepo.findOne({ where: { email: studentEmail } });

    if (!studentUser) {
        studentUser = userRepo.create({
            email: studentEmail,
            passwordHash: bcrypt.hashSync('secret', 10),
            isSuperAdmin: false
        });
        await userRepo.save(studentUser);

        const studentProfile = profileRepo.create({
            user: studentUser,
            faculty: faculty,
            department: dept,
            type: ProfileType.STUDENT,
            code: 'S-2024-001',
            designation: 'Undergraduate',
            metadata: { batch: '2024', semester: 1 }
        });
        await profileRepo.save(studentProfile);
        console.log('Created Student: Student 1');
    }

    // 6. Create Student 2
    const studentEmail2 = 'student2@university.edu';
    let studentUser2 = await userRepo.findOne({ where: { email: studentEmail2 } });

    if (!studentUser2) {
        studentUser2 = userRepo.create({
            email: studentEmail2,
            passwordHash: bcrypt.hashSync('secret', 10),
            isSuperAdmin: false
        });
        await userRepo.save(studentUser2);

        const studentProfile2 = profileRepo.create({
            user: studentUser2,
            faculty: faculty,
            department: dept,
            type: ProfileType.STUDENT,
            code: 'S-2024-002',
            designation: 'Undergraduate',
            metadata: { batch: '2024', semester: 1 }
        });
        await profileRepo.save(studentProfile2);
        console.log('Created Student: Student 2');
    }

    // 7. Create Staff (Registrar)
    const staffEmail = 'staff@university.edu';
    let staffUser = await userRepo.findOne({ where: { email: staffEmail } });

    if (!staffUser) {
        staffUser = userRepo.create({
            email: staffEmail,
            passwordHash: bcrypt.hashSync('secret', 10),
            isSuperAdmin: false
        });
        await userRepo.save(staffUser);

        const staffProfile = profileRepo.create({
            user: staffUser,
            faculty: faculty,
            department: null, // Staff might belong to faculty directly, not department
            type: ProfileType.STAFF,
            code: 'ST-001',
            designation: 'Faculty Registrar',
        });
        await profileRepo.save(staffProfile);
        console.log('Created Staff: Registrar');
    }

    // 8. Create Semester
    const semesterRepo = app.get(getRepositoryToken(Semester));
    let semester = await semesterRepo.findOne({ where: { name: 'Fall 2024' } });
    if (!semester) {
        semester = semesterRepo.create({
            name: 'Fall 2024',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-12-31'),
            isActive: true
        });
        await semesterRepo.save(semester);
        console.log('Created Semester: Fall 2024');
    }

    // 9. Create Course
    const courseRepo = app.get(getRepositoryToken(Course));
    let course = await courseRepo.findOne({ where: { code: 'CS-101' } });
    if (!course) {
        course = courseRepo.create({
            title: 'Introduction to Programming',
            code: 'CS-101',
            credits: 3,
            department: dept,
            departmentId: dept.id,
            faculty: faculty,
            facultyId: faculty.id
        });
        await courseRepo.save(course);
        console.log('Created Course: CS-101');
    }

    // 10. Create Course Offering
    const offeringRepo = app.get(getRepositoryToken(CourseOffering));
    // Find teacher profile again (we created it earlier in step 4)
    const profUser = await userRepo.findOne({ where: { email: 'prof.smith@university.edu' } });
    const profProfile = await profileRepo.findOne({ where: { userId: profUser.id } });

    let offering = await offeringRepo.findOne({ where: { courseId: course.id, semesterId: semester.id } });
    if (!offering) {
        offering = offeringRepo.create({
            course: course,
            semester: semester,
            teacher: profProfile, // Prof. Smith
            faculty: faculty,
            facultyId: faculty.id,
            teacherProfileId: profProfile.id,
            semesterId: semester.id,
            courseId: course.id
        });
        await offeringRepo.save(offering);
        console.log('Created Offering: CS-101 (Fall 2024)');
    }

    // 11. Enroll Students
    const enrollmentRepo = app.get(getRepositoryToken(Enrollment));

    // Enroll Student 1
    const enrollStudent1User = await userRepo.findOne({ where: { email: 'student1@university.edu' } });
    const enrollStudent1Profile = await profileRepo.findOne({ where: { userId: enrollStudent1User.id } });

    let enrollment1 = await enrollmentRepo.findOne({ where: { studentProfileId: enrollStudent1Profile.id, courseOfferingId: offering.id } });
    if (!enrollment1) {
        enrollment1 = enrollmentRepo.create({
            student: enrollStudent1Profile,
            courseOffering: offering,
            faculty: faculty,
            facultyId: faculty.id,
            studentProfileId: enrollStudent1Profile.id,
            courseOfferingId: offering.id,
            status: EnrollmentStatus.COMPLETED,
            grade: 91,
            letterGrade: 'A',
            gradePoints: 4.0,
        });
        await enrollmentRepo.save(enrollment1);
        console.log('Enrolled Student 1 in CS-101 (Completed, Grade A)');
    }

    // Enroll Student 2
    const enrollStudent2User = await userRepo.findOne({ where: { email: 'student2@university.edu' } });
    const enrollStudent2Profile = await profileRepo.findOne({ where: { userId: enrollStudent2User.id } });

    let enrollment2 = await enrollmentRepo.findOne({ where: { studentProfileId: enrollStudent2Profile.id, courseOfferingId: offering.id } });
    if (!enrollment2) {
        enrollment2 = enrollmentRepo.create({
            student: enrollStudent2Profile,
            courseOffering: offering,
            faculty: faculty,
            facultyId: faculty.id,
            studentProfileId: enrollStudent2Profile.id,
            courseOfferingId: offering.id,
            status: EnrollmentStatus.ENROLLED
        });
        await enrollmentRepo.save(enrollment2);
        console.log('Enrolled Student 2 in CS-101');
    }

    // 12. Create Sample Notifications
    const notifRepo = app.get(getRepositoryToken(Notification));
    let sampleNotif = await notifRepo.findOne({ where: { userId: enrollStudent1User.id } });
    if (!sampleNotif) {
        await notifRepo.save([
            notifRepo.create({
                userId: enrollStudent1User.id,
                title: 'Welcome to UniPortal!',
                message: 'Your student account has been successfully created. Explore your enrolled courses and upcoming assignments.',
                type: NotificationType.GENERAL,
                isRead: false,
            }),
            notifRepo.create({
                userId: enrollStudent1User.id,
                title: 'Assignment Graded',
                message: 'Your assignment "Programming Lab 1" has been graded. Final Score: 91/100.',
                type: NotificationType.GRADE_POSTED,
                isRead: false,
            }),
        ]);
        console.log('Created Sample Notifications for Student 1');
    }

    // 13. Create Time Slots / Schedule
    const timeSlotRepo = app.get(getRepositoryToken(TimeSlot));
    let sampleTimeSlot = await timeSlotRepo.findOne({ where: { courseOfferingId: offering.id } });
    if (!sampleTimeSlot) {
        await timeSlotRepo.save([
            timeSlotRepo.create({
                courseOfferingId: offering.id,
                facultyId: faculty.id,
                dayOfWeek: DayOfWeek.MONDAY,
                startTime: '09:00',
                endTime: '10:30',
                room: 'Auditorium Hall A-101',
            }),
            timeSlotRepo.create({
                courseOfferingId: offering.id,
                facultyId: faculty.id,
                dayOfWeek: DayOfWeek.WEDNESDAY,
                startTime: '09:00',
                endTime: '10:30',
                room: 'Auditorium Hall A-101',
            }),
            timeSlotRepo.create({
                courseOfferingId: offering.id,
                facultyId: faculty.id,
                dayOfWeek: DayOfWeek.FRIDAY,
                startTime: '11:00',
                endTime: '12:30',
                room: 'Computer Lab 3',
            }),
        ]);
        console.log('Created Sample Time Slots for CS-101');
    }

    console.log('Seeding complete!');
    await app.close();
}
bootstrap();
