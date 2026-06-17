import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from typing import Optional
import logging

from ..config import settings

logger = logging.getLogger(__name__)

# Chemin vers le logo
LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '..', 'izifind-app', 'src', 'assets', 'images', 'logo.png')


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: Optional[str] = None
) -> bool:
    """
    Envoie un email via SMTP.
    
    Args:
        to_email: Adresse email du destinataire
        subject: Sujet de l'email
        html_content: Contenu HTML de l'email
        plain_text: Version texte brut (optionnelle)
    
    Returns:
        True si l'email a été envoyé, False sinon
    """
    # Vérifier que la configuration SMTP est complète
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD or not settings.SENDER_EMAIL:
        logger.error("SMTP configuration incomplete. Check .env file.")
        return False
    
    try:
        # Créer le message
        message = MIMEMultipart("related")
        message["Subject"] = subject
        message["From"] = f"{settings.SENDER_NAME} <{settings.SENDER_EMAIL}>"
        message["To"] = to_email

        # Partie alternative pour texte et HTML
        alternative_part = MIMEMultipart("alternative")
        
        # Ajouter la version texte brut si fournie
        if plain_text:
            alternative_part.attach(MIMEText(plain_text, "plain"))
        
        # Ajouter la version HTML
        alternative_part.attach(MIMEText(html_content, "html"))
        
        message.attach(alternative_part)

        # Ajouter le logo en pièce jointe si disponible
        if os.path.exists(LOGO_PATH):
            try:
                with open(LOGO_PATH, 'rb') as img_file:
                    img = MIMEImage(img_file.read())
                    img.add_header('Content-ID', '<logo>')
                    img.add_header('Content-Disposition', 'inline', filename='logo.png')
                    message.attach(img)
            except Exception as e:
                logger.warning(f"Failed to attach logo: {e}")

        # Envoyer l'email
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SENDER_EMAIL, to_email, message.as_string())

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(f"SMTP authentication failed for {settings.SMTP_USER}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_password_reset_email(to_email: str, username: str, reset_url: str) -> bool:
    """
    Envoie un email de réinitialisation de mot de passe.
    
    Args:
        to_email: Email du destinataire
        username: Nom d'utilisateur
        reset_url: URL complète avec le token pour réinitialiser le mot de passe
    
    Returns:
        True si l'email a été envoyé
    """
    subject = "Réinitialisation de votre mot de passe IZIFIND"
    
    # Version HTML professionnelle avec couleurs de l'app
    html_content = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe - IZIFIND</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
                background-color: #faf9f6;
                color: #151a31;
                line-height: 1.6;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .email-header {{
                background-color: #ffffff;
                padding: 30px 20px;
                text-align: center;
                border-radius: 18px 18px 0 0;
                border-bottom: 2px solid rgba(244, 149, 23, 0.1);
            }}
            .logo-img {{
                max-height: 80px;
                width: auto;
                display: inline-block;
            }}
            .email-body {{
                background-color: #ffffff;
                padding: 40px 30px;
                border-radius: 0 0 18px 18px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }}
            .greeting {{
                font-size: 24px;
                font-weight: 700;
                color: #151a31;
                margin-bottom: 20px;
            }}
            .message {{
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 30px;
            }}
            .reset-button-container {{
                text-align: center;
                margin: 30px 0;
            }}
            .reset-button {{
                display: inline-block;
                background: linear-gradient(135deg, #f49517 0%, #f5a623 100%);
                color: #ffffff !important;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(244, 149, 23, 0.3);
                transition: all 0.2s ease;
            }}
            .reset-button:hover {{
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(244, 149, 23, 0.4);
            }}
            .link-container {{
                margin-top: 20px;
                padding: 15px;
                background-color: #faf9f6;
                border-radius: 12px;
                word-break: break-all;
            }}
            .link-label {{
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 8px;
            }}
            .link-url {{
                color: #f49517;
                font-size: 13px;
            }}
            .divider {{
                height: 1px;
                background-color: rgba(21, 26, 49, 0.08);
                margin: 30px 0;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 13px;
            }}
            .footer-note {{
                margin-bottom: 10px;
            }}
            .safe-note {{
                background-color: rgba(244, 149, 23, 0.08);
                border-left: 4px solid #f49517;
                padding: 15px;
                border-radius: 0 12px 12px 0;
                margin-top: 30px;
            }}
            .safe-note-text {{
                color: #151a31;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="cid:logo" alt="IZIFIND" class="logo-img">
            </div>
            
            <div class="email-body">
                <h1 class="greeting">Bonjour {username},</h1>
                
                <p class="message">
                    Vous avez demandé la réinitialisation de votre mot de passe. 
                    Pas de panique, nous sommes là pour vous aider !
                </p>
                
                <div class="reset-button-container">
                    <a href="{reset_url}" class="reset-button">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <div class="link-container">
                    <p class="link-label">Ou copiez-collez ce lien dans votre navigateur :</p>
                    <p class="link-url">{reset_url}</p>
                </div>
                
                <div class="divider"></div>
                
                <div class="safe-note">
                    <p class="safe-note-text">
                        <strong>Important :</strong> Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette réinitialisation, 
                        ignorez simplement cet email et votre compte restera sécurisé.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p class="footer-note">
                    &copy; 2025 IZIFIND. Tous droits réservés.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Version texte
    plain_text = f"""
    Réinitialisation de mot de passe IZIFIND
    
    Bonjour {username},
    
    Vous avez demandé la réinitialisation de votre mot de passe.
    
    Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe (valide 24 heures) :
    {reset_url}
    
    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    Votre compte reste sécurisé.
    
    &copy; 2025 IZIFIND. Tous droits réservés.
    """
    
    return send_email(to_email, subject, html_content, plain_text)
