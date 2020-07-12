<?php
/*
* Contact Form Class
*/
require_once '/var/www/html/vendor/autoload.php';

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$admin_email = getenv('MAIL_TO'); // Your Email
$message_min_length = 5; // Min Message Length


class Contact_Form{
	function __construct($details, $email_admin, $message_min_length){

		$this->name = stripslashes($details['name']);
		$this->email = trim($details['email']);
		$this->subject = 'Contact from Your Website'; // Subject
		$this->message = stripslashes($details['message']);

		$this->email_admin = $email_admin;
		$this->message_min_length = $message_min_length;
		$this->smtp_username = getenv('MAIL_USERNAME');
		$this->smtp_password = getenv('MAIL_PASSWORD');
		$this->smtp_host = getenv('MAIL_HOST');
		$this->smtp_port = getenv('MAIL_PORT');

		$this->response_status = 1;
		$this->response_html = '';
	}


	private function validateEmail(){
		$regex = '/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i';

		if($this->email == '') {
			return false;
		} else {
			$string = preg_replace($regex, '', $this->email);
		}

		return empty($string) ? true : false;
	}


	private function validateFields(){
		// Check name
		if(!$this->name)
		{
			$this->response_html .= '<p>Please enter your name</p>';
			$this->response_status = 0;
		}

		// Check email
		if(!$this->email)
		{
			$this->response_html .= '<p>Please enter an e-mail address</p>';
			$this->response_status = 0;
		}

		// Check valid email
		if($this->email && !$this->validateEmail())
		{
			$this->response_html .= '<p>Please enter a valid e-mail address</p>';
			$this->response_status = 0;
		}

		// Check message length
		if(!$this->message || strlen($this->message) < $this->message_min_length)
		{
			$this->response_html .= '<p>Please enter your message. It should have at least '.$this->message_min_length.' characters</p>';
			$this->response_status = 0;
		}
	}


	private function sendEmail(){
		$transport = (new Swift_SmtpTransport($this->smtp_host, $this->smtp_port, 'tls'))
		  ->setUsername($this->smtp_username)
		  ->setPassword($this->smtp_password);

		$mailer = new Swift_Mailer($transport);

		$message = (new Swift_Message($this->subject))
		  ->setFrom([$this->email => $this->name])
		  ->setTo($this->email_admin)
		  ->setBody($this->message);

		$result = $mailer->send($message);

		if($result > 0)
		{
			$this->response_status = 1;
			$this->response_html = '<p>Thank You!</p>';
		}
	}


	function sendRequest(){
		$this->validateFields();

		if($this->response_status)
		{
			$this->sendEmail();
		}

		$response = array();
		$response['status'] = $this->response_status;
		$response['html'] = $this->response_html;

		echo json_encode($response);
	}
}


$contact_form = new Contact_Form($_POST, $admin_email, $message_min_length);
$contact_form->sendRequest();

?>
