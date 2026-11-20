-- schema.sql ke BAAD SQL Editor me run karo

insert into specializations (id, name) values
 (1,'General Physician'),(2,'Cardiologist'),(3,'Dermatologist'),
 (4,'Pediatrician'),(5,'Orthopedic'),(6,'ENT Specialist'),(7,'Gynecologist')
on conflict do nothing;

insert into doctors (id, name, specialization_id, experience_years, fee, bio) values
 (1,'Dr. Anjali Mehta',1,12,500,'Fever, infections aur routine check-up ke liye.'),
 (2,'Dr. Rohan Kulkarni',2,18,1200,'Heart health aur BP management.'),
 (3,'Dr. Sneha Iyer',3,9,800,'Skin, hair aur allergy treatment.'),
 (4,'Dr. Imran Shaikh',4,14,700,'Bachon ki health aur vaccination.'),
 (5,'Dr. Vikram Desai',5,16,1000,'Joint pain, fracture aur sports injury.'),
 (6,'Dr. Pooja Nair',6,8,700,'Kaan, naak aur gala.'),
 (7,'Dr. Kavita Joshi',7,15,900,'Women health aur pregnancy care.')
on conflict do nothing;

-- id manually diye the, isliye counters aage badha do
select setval(pg_get_serial_sequence('specializations','id'), (select max(id) from specializations));
select setval(pg_get_serial_sequence('doctors','id'), (select max(id) from doctors));

-- day_of_week: 0=Sun, 1=Mon ... 6=Sat
insert into doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_minutes) values
 (1,1,'09:00','13:00',20),(1,2,'09:00','13:00',20),(1,3,'09:00','13:00',20),(1,4,'09:00','13:00',20),(1,5,'09:00','13:00',20),
 (2,1,'10:00','14:00',30),(2,3,'10:00','14:00',30),(2,5,'10:00','14:00',30),
 (3,2,'14:00','18:00',30),(3,4,'14:00','18:00',30),(3,6,'10:00','13:00',30),
 (4,1,'16:00','20:00',20),(4,2,'16:00','20:00',20),(4,4,'16:00','20:00',20),(4,6,'09:00','12:00',20),
 (5,1,'11:00','15:00',30),(5,3,'11:00','15:00',30),(5,5,'11:00','15:00',30),
 (6,2,'09:00','12:00',20),(6,4,'09:00','12:00',20),(6,6,'09:00','12:00',20),
 (7,1,'15:00','19:00',30),(7,3,'15:00','19:00',30),(7,5,'15:00','19:00',30)
on conflict do nothing;
