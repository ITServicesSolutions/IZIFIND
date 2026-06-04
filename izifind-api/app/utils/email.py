import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from ..config import settings

logger = logging.getLogger(__name__)


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
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.SENDER_NAME} <{settings.SENDER_EMAIL}>"
        message["To"] = to_email

        # Ajouter la version texte brut si fournie
        if plain_text:
            message.attach(MIMEText(plain_text, "plain"))
        
        # Ajouter la version HTML
        message.attach(MIMEText(html_content, "html"))

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
    
    # Version HTML
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour <strong>{username}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe (valide 24 heures) :</p>
            <p>
                <a href="{reset_url}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                    Réinitialiser mon mot de passe
                </a>
            </p>
            <p>Ou copiez-collez ce lien :</p>
            <p style="word-break: break-all; color: #666;">{reset_url}</p>
            <p style="color: #999; font-size: 12px;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
                Votre compte reste sécurisé.
            </p>
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
    """
    
    return send_email(to_email, subject, html_content, plain_text)
