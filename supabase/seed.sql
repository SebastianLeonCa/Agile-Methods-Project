-- Sample litter spots around Carnegie Mellon University, Pittsburgh, PA.
-- Safe to run more than once (fixed ids, existing rows are skipped).

insert into spots (id, title, description, type, urgency, status, lat, lng, address, before_photo_url, after_photo_url, created_at) values
  ('00000000-0000-4000-8000-000000000001',
   'Plastic around Panther Hollow Lake',
   'Bottles and plastic bags floating along the edge of the lake and stuck in the reeds.',
   'park', 'high', 'dirty', 40.4357, -79.9462,
   'Panther Hollow Lake, Schenley Park, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-1/800/600', null, now() - interval '2 days'),

  ('00000000-0000-4000-8000-000000000002',
   'Picnic trash on Flagstaff Hill',
   'Cups, food containers and napkins left on the grass after a weekend movie night.',
   'park', 'medium', 'dirty', 40.4395, -79.9450,
   'Flagstaff Hill, Schenley Drive, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-2/800/600', null, now() - interval '5 days'),

  ('00000000-0000-4000-8000-000000000003',
   'Dumped tires in Junction Hollow',
   'Old tires and construction debris dumped next to the trail. Needs several people to carry out.',
   'other', 'high', 'planned', 40.4400, -79.9503,
   'Junction Hollow Trail, Boundary Street, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-3/800/600', null, now() - interval '9 days'),

  ('00000000-0000-4000-8000-000000000004',
   'Overflowing bins at Forbes & Craig',
   'Trash cans overflowing onto the sidewalk; wrappers blowing into the street.',
   'street', 'medium', 'dirty', 40.4444, -79.9489,
   'Forbes Avenue & South Craig Street, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-4/800/600', null, now() - interval '1 day'),

  ('00000000-0000-4000-8000-000000000005',
   'Litter around Schenley Plaza lawn',
   'Scattered cans and paper around the lawn and the carousel. Cleaned by volunteers.',
   'park', 'low', 'clean', 40.4430, -79.9530,
   'Schenley Plaza, Forbes Avenue, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-5/800/600', 'https://picsum.photos/seed/cleanup-5-after/800/600', now() - interval '20 days'),

  ('00000000-0000-4000-8000-000000000006',
   'Cigarette butts at Morewood bus stop',
   'Lots of cigarette butts and coffee cups around the bus shelter.',
   'street', 'low', 'dirty', 40.4458, -79.9420,
   'Morewood Avenue & Forbes Avenue, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-6/800/600', null, now() - interval '3 days'),

  ('00000000-0000-4000-8000-000000000007',
   'Trash along Frew Street',
   'Bottles and flyers along the curb behind campus. Cleaned after a student cleanup.',
   'street', 'medium', 'clean', 40.4415, -79.9445,
   'Frew Street, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-7/800/600', 'https://picsum.photos/seed/cleanup-7-after/800/600', now() - interval '30 days'),

  ('00000000-0000-4000-8000-000000000008',
   'Plastic caught in Panther Hollow Run',
   'Plastic bags and bottles trapped by branches in the stream below the lake.',
   'river', 'high', 'dirty', 40.4330, -79.9495,
   'Panther Hollow Run, Schenley Park, Pittsburgh, PA 15213',
   'https://picsum.photos/seed/cleanup-8/800/600', null, now() - interval '6 days'),

  ('00000000-0000-4000-8000-000000000009',
   'Litter near Hobart Street entrance',
   'A few bags of litter along the path near the golf course edge.',
   'park', 'low', 'dirty', 40.4320, -79.9380,
   'Hobart Street entrance, Schenley Park, Pittsburgh, PA 15217',
   'https://picsum.photos/seed/cleanup-9/800/600', null, now() - interval '12 days')
on conflict (id) do nothing;
