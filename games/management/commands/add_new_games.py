from django.core.management.base import BaseCommand
from games.models import Game


class Command(BaseCommand):
    help = 'Add new games to the database (Word Blast, Capital Quest, Tile Match, History Timeline)'

    def handle(self, *args, **options):
        games_data = [
            {
                'name': 'Word Blast',
                'slug': 'word-blast',
                'description': 'Unscramble letters to form words within the time limit.',
                'description_uzbek': 'Vaqt chеgarasi ichida harflarni shakllantirish uchun so\'zlarni tartiblashtiringiz.',
                'category': 'word',
                'difficulty_level': 'medium',
                'icon': 'fa-spell-check',
                'is_active': True,
            },
            {
                'name': 'History Timeline',
                'slug': 'history-timeline',
                'description': 'Order historical events chronologically.',
                'description_uzbek': 'Tarixiy hodisalarni xronologik tartibda aniqlashtiringiz.',
                'category': 'history',
                'difficulty_level': 'medium',
                'icon': 'fa-history',
                'is_active': True,
            },
        ]

        for game_data in games_data:
            game, created = Game.objects.get_or_create(
                slug=game_data['slug'],
                defaults={
                    'name': game_data['name'],
                    'description': game_data['description'],
                    'description_uzbek': game_data['description_uzbek'],
                    'category': game_data['category'],
                    'difficulty_level': game_data['difficulty_level'],
                    'icon': game_data['icon'],
                    'is_active': game_data['is_active'],
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created game: {game.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⊘ Game already exists: {game.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('✓ All games processed successfully!')
        )
