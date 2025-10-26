from django.core.management.base import BaseCommand
from accounts.models import Achievement


class Command(BaseCommand):
    help = 'Create default achievements for the game'

    def handle(self, *args, **options):
        achievements = [
            {
                'title': "Birinchi o'yin",
                'description': "Birinchi o'yinni o'ynash",
                'icon': 'fa-play-circle',
                'achievement_type': 'FIRST_PLAY',
                'requirement': 1,
            },
            {
                'title': '1000 ball',
                'description': 'Jami 1000 ball to\'plash',
                'icon': 'fa-star',
                'achievement_type': 'SCORE_1000',
                'requirement': 1000,
            },
            {
                'title': 'Top 10 o\'yinchisi',
                'description': 'Umumiy reytingda Top 10 tarkibiga kirish',
                'icon': 'fa-medal',
                'achievement_type': 'TOP_10',
                'requirement': 10,
            },
            {
                'title': 'Olov qatnashishi',
                'description': '7 kun ketma-ket o\'yin o\'ynash',
                'icon': 'fa-fire',
                'achievement_type': 'STREAK_MASTER',
                'requirement': 7,
            },
            {
                'title': 'Barcha o\'yinlar',
                'description': 'Barcha mavjud o\'yinlarni o\'ynash',
                'icon': 'fa-gamepad',
                'achievement_type': 'ALL_GAMES',
                'requirement': 0,
            },
            {
                'title': 'O\'yin g\'olibi',
                'description': 'Bir o\'yinda 500 yoki ko\'proq ball to\'plash',
                'icon': 'fa-crown',
                'achievement_type': 'GAME_WINNER',
                'requirement': 500,
            },
        ]

        created_count = 0
        updated_count = 0

        for ach_data in achievements:
            achievement, created = Achievement.objects.update_or_create(
                achievement_type=ach_data['achievement_type'],
                defaults={
                    'title': ach_data['title'],
                    'description': ach_data['description'],
                    'icon': ach_data['icon'],
                    'requirement': ach_data['requirement'],
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement.title}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated achievement: {achievement.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully processed {len(achievements)} achievements. '
                f'Created: {created_count}, Updated: {updated_count}'
            )
        )
