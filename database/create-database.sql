create database if not exists flexpath_final;
use flexpath_final;

drop table if exists collection_notes, collections, notes, categories, roles, users;

create table users (
    username varchar(255) primary key,
    password varchar(255)
);

create table roles (
    username varchar(255) not null,
    role varchar(255) not null,
    primary key (username, role),
    foreign key (username) references users(username) on delete cascade
);

create table categories (
    id int primary key auto_increment,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp,

    name varchar(255) not null unique
);

create table notes (
    id int primary key auto_increment,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp,

    title varchar(255) not null,
    content text not null,
    is_public bool not null default false,

    username varchar(255) not null,
    category_id int,
    foreign key (username) references users(username) on delete cascade,
    foreign key (category_id) references categories(id) on delete set null
);

create table collections (
    id int primary key auto_increment,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp,

    name varchar(255) not null,
    description text,
    is_public bool not null default false,

    username varchar(255) not null,
    foreign key (username) references users(username) on delete cascade
);

create table collection_notes (
    primary key (collection_id, note_id),
    created_at datetime default current_timestamp,

    collection_id int not null,
    note_id int not null,
    foreign key (collection_id) references collections(id) on delete cascade,
    foreign key (note_id) references notes(id) on delete cascade
);


-- admin user
insert into users (username, password) values ('admin', '$2a$10$tBTfzHzjmQVKza3VSa5lsOX6/iL93xPVLlLXYg2FhT6a.jb1o6VDq');
insert into roles (username, role) values ('admin', 'ADMIN');
insert into users (username, password) values ('admin2', '$2a$10$zmHsli18qX3i4RoDMwGbPeAPS7zYx/iE9q2kIafxpn2biAMnx0lCW');
insert into roles (username, role) values ('admin2', 'ADMIN');
insert into categories (name) values ('CSS');
insert into categories (name) values ('HTML');
insert into categories (name) values ('Java');
insert into categories (name) values ('JavaScript');
insert into categories (name) values ('MySQL');
insert into categories (name) values ('Maven');
insert into categories (name) values ('React');
insert into categories (name) values ('Spring Boot');

-- users
insert into users (username, password) values ('user', '$2a$10$tBTfzHzjmQVKza3VSa5lsOX6/iL93xPVLlLXYg2FhT6a.jb1o6VDq');
insert into roles (username, role) values ('user', 'USER');
insert into users (username, password) values ('user2', '$2a$10$P3M6cTgjgl/4Dksy7RoYD.IqsU3P67XxtViD6.gLrdvO9KI1w1YMu');
insert into roles (username, role) values ('user2', 'USER');
-- public/private notes by regular user
insert into notes
    (title, content, is_public, username, category_id)
values ('Create Database', '', true, 'user', (select id from categories where name = 'MySQL'));
insert into notes
    (title, content, is_public, username, category_id)
values ('React Router', '', false, 'user', (select id from categories where name = 'React'));
-- public/private notes by another user
insert into notes
    (title, content, is_public, username, category_id)
values ('Bootstrap', '', true, 'user2', (select id from categories where name = 'CSS'));
insert into notes
    (title, content, is_public, username, category_id)
values ('div, span, a', '', false, 'user2', (select id from categories where name = 'HTML'));
-- public/private collections
insert into collections (name, is_public, username) values ('Read Later', false, 'user');
insert into collections (name, is_public, username) values ('My Best 2026', true, 'user');
insert into collections (name, is_public, username) values ('My private notes', false, 'user2');
insert into collections (name, is_public, username) values ('Useful notes for the final project', true, 'user2');
-- many-to-many
insert into collection_notes (collection_id, note_id) values (1, 1);
insert into collection_notes (collection_id, note_id) values (1, 2);
insert into collection_notes (collection_id, note_id) values (1, 3);
insert into collection_notes (collection_id, note_id) values (2, 1);
insert into collection_notes (collection_id, note_id) values (2, 2);
insert into collection_notes (collection_id, note_id) values (2, 3);
insert into collection_notes (collection_id, note_id) values (3, 1);
insert into collection_notes (collection_id, note_id) values (3, 3);
insert into collection_notes (collection_id, note_id) values (3, 4);
insert into collection_notes (collection_id, note_id) values (4, 3);
insert into collection_notes (collection_id, note_id) values (4, 4);
