import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseFacultyEntity } from '../../common/entities/base.entity';
import { Course } from './course.entity';
import { Semester } from './semester.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('course_offerings')
export class CourseOffering extends BaseFacultyEntity {
    @ManyToOne(() => Course)
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @Column({ type: 'uuid' })
    courseId: string;

    @ManyToOne(() => Semester)
    @JoinColumn({ name: 'semesterId' })
    semester: Semester;

    @Column({ type: 'uuid' })
    semesterId: string;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'teacherProfileId' })
    teacher: Profile;

    @Column({ type: 'uuid' })
    teacherProfileId: string;

    @ManyToOne(() => Faculty)
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;
}
