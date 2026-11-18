-- Custom SQL migration file, put your code below! --
INSERT INTO roles (title, description) VALUES
    ('attendee', 'A registered user who can buy tickets and view their orders'),
    ('organizer', 'A user who can create events and tickets'),
    ('admin', 'A user who can view and suspend users and events')
ON CONFLICT (title) DO NOTHING;