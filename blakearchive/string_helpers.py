def convert_to_string(text):
    try:
        string_text = text.decode("utf-8")
    except (AttributeError, ValueError):
        string_text = str(text)
    trimmed_text = string_text.strip()
    if trimmed_text is None:
        return ''
    return trimmed_text
