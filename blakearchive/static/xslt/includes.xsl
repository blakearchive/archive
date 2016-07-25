<!-- William Blake Archive includes.xsl Last Modified 2005-03-20 Aziza Technology Associates,LLC -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exist="http://exist.sourceforge.net/NS/exist" xmlns:str="http://exslt.org/strings" extension-element-prefixes="str">
    <xsl:include href="globals.xsl"/>
    <xsl:variable name="lcletters">abcdefghijklmnopqrstuvwxyz</xsl:variable>
    <xsl:variable name="ucletters">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
    <xsl:strip-space elements="title copy main set"/>
                <!--Global parameters-->
    <xsl:param name="baseuri"/>
    <xsl:param name="java"/>
    <xsl:param name="vg"/>
    <xsl:param name="objectid"/>
    <xsl:param name="vcontext"/>
    <xsl:param name="titles"/>
    <xsl:param name="mode"/>
    <xsl:param name="term"/>
    <xsl:param name="landing"/>
    <xsl:param name="scriptname">index</xsl:param>
    <xsl:param name="basepath">
        <xsl:for-each select="str:tokenize($baseuri, '/')">
            <xsl:if test="position() != last()">/<xsl:value-of select="."/>
            </xsl:if>
        </xsl:for-each>
    </xsl:param>
    <xsl:param name="querystring"/>
    <xsl:variable name="labelfile" select="document('labels.xml')"/>
    <xsl:key name="label" match="label" use="@element"/>
                <!--  multi-purpose templates -->
                <!-- used to insert consistent information into the head of the document -->
    <!--<xsl:template name="htmlhead">-->
        <!--<head>-->
            <!--<title>-->
                <!--<xsl:value-of select="//head/title"/>-->
            <!--</title>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/applets/lightbox/lb.js</xsl:attribute>-->
            <!--</script>-->
            <!--<link>-->
                <!--<xsl:attribute name="rel">stylesheet</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/css</xsl:attribute>-->
                <!--<xsl:attribute name="href">/blake/style.css</xsl:attribute>-->
            <!--</link>-->
            <!--<link>-->
                <!--<xsl:attribute name="rel">stylesheet</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/css</xsl:attribute>-->
                <!--<xsl:attribute name="href">/blake/slider.css</xsl:attribute>-->
            <!--</link>-->
            <!--<link>-->
                <!--<xsl:attribute name="rel">stylesheet</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/css</xsl:attribute>-->
                <!--<xsl:attribute name="href">http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css</xsl:attribute>-->
            <!--</link>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.13/jquery-ui.min.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/jQueryRotate.2.1.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/binaryajax.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/imageinfo.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
                <!--<![CDATA[-->
                <!--var _gaq = _gaq || [];-->
  <!--_gaq.push(['_setAccount', 'UA-32657888-1']);-->
  <!--_gaq.push(['_trackPageview']);-->

  <!--(function() {-->
    <!--var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;-->
    <!--ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';-->
    <!--var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);-->
  <!--})();-->
                <!--]]></script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/exif.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/accessibleUISlider.jQuery.js</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/functions.js</xsl:attribute>-->
            <!--</script>-->
            <!--<style>-->
                <!--<xsl:attribute name="type">text/css</xsl:attribute>-->
                <!--<xsl:value-of select="//head/style"/>-->
            <!--</style>-->
            <!--<meta lang="en"/>-->
            <!--<script>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
                <!--<xsl:value-of select="//head/script"/>-->
            <!--</script>-->
            <!--<link>-->
                <!--<xsl:attribute name="rel">meta</xsl:attribute>-->
                <!--<xsl:attribute name="type">application/rdf+xml</xsl:attribute>-->
                <!--<xsl:attribute name="href">/exist/blake/archive/rdf.xq?req=<xsl:value-of select="$objectid"/>&amp;mode=obj</xsl:attribute>-->
            <!--</link>-->
        <!--</head>-->
    <!--</xsl:template>-->
    <xsl:template match="xref">
        <a>
            <xsl:attribute name="href">
                <xsl:value-of select="$blakeroot"/>archive/object.xq?objectid=<xsl:value-of select="translate(@doc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>&amp;java=no</xsl:attribute>
            <xsl:attribute name="target">wbamain</xsl:attribute>
            <xsl:apply-templates/>
        </a>
    </xsl:template>
    <!--<xsl:template name="htmlhead2">-->
        <!--<head>-->
            <!--<title>-->
                <!--<xsl:value-of select="//head/title"/>-->
            <!--</title>-->
            <!--<script>-->
                <!--<xsl:attribute name="src">/blake/functions.js</xsl:attribute>-->
            <!--</script>-->
            <!--<script>-->
                <!--<xsl:attribute name="language">javascript</xsl:attribute>-->
                <!--<xsl:attribute name="type">text/javascript</xsl:attribute>-->
                <!--<xsl:attribute name="src">/blake/template/includes/style_call.txt</xsl:attribute>-->
            <!--</script>-->
            <!--<meta lang="en"/>-->
        <!--</head>-->
    <!--</xsl:template>-->

	<!-- generates a "viewed on datestamp
and the URL of current document -->
    <xsl:template name="datestamp">
        <xsl:choose>
            <xsl:when test="contains($baseuri,'comparison')">
				<!-- do not datestamp comparison page -->
            </xsl:when>
            <xsl:otherwise>
                <p>
                    <script language="JavaScript">
                        datestamp( );   
                </script>
                </p>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


<!--copies any embedded scripts exactly -->
    <xsl:template match="script">
        <xsl:copy-of select="."/>
    </xsl:template>

<!-- matches the main part of the title in titlestmt/title  -->
    <xsl:template match="main">
        <span style="font-style:italic">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
    <xsl:template match="author">
        <span style="font-style:normal">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
    <xsl:template match="copy|set|institution">
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="hi">
        <xsl:choose>
            <xsl:when test="@rend='italic' or @rend='i'">
                <span class="tei-hi-italic"> <!--  style="font-style:italic" -->
                    <xsl:value-of select="."/>
                </span>
            </xsl:when>
            <xsl:when test="@rend='underscore' or @rend='u'">
                <span class="tei-hi-underscore"> <!-- style="text-decoration:underline" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="@rend='superscript' or @rend='sup'">
                <sup>
                    <xsl:apply-templates/>
                </sup>
            </xsl:when>
            <xsl:when test="@rend='subscript' or @rend='sub'">
                <sub>
                    <xsl:apply-templates/>
                </sub>
            </xsl:when>
            <xsl:when test="@rend= 'roman' or @rend = 'normal'">
                <span class="tei-hi-normal"> <!-- style="font-style:normal" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-hi-normal">
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <!--<xsl:template name="linkmaker">-->
        <!--<xsl:choose>-->
            <!--<xsl:when test="@type='work' or @type='copy' or @type='object'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">-->
                        <!--/exist/blake/archive/<xsl:value-of select="@type"/>.xq?<xsl:value-of select="@type"/>id=<xsl:value-of select="translate(@ptr,$ucletters,$lcletters)"/>&amp;java=no</xsl:attribute>-->
                    <!--<xsl:apply-templates/>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:when test="@type='copyinfo'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">-->
                        <!--<xsl:value-of select="$basepath"/>-->
                        <!--<xsl:value-of select="@type"/>.xq?copyid=<xsl:value-of select="translate(@ptr,$ucletters,$lcletters)"/>&amp;java=no</xsl:attribute>-->
                    <!--<xsl:apply-templates/>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:when test="@type='vgroup'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">-->
                        <!--<xsl:value-of select="$basepath"/>/<xsl:value-of select="@type"/>.xq?id=<xsl:value-of select="translate(@ptr,$ucletters,$lcletters)"/>&amp;java=no</xsl:attribute>-->
                    <!--<xsl:apply-templates/>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:when test="@type='compare'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">-->
                        <!--/exist/blake/archive/comparison.xq?selection=compare&amp;copies=all&amp;copyid=<xsl:value-of select="@ptr"/>&amp;bentleynum=<xsl:value-of select="@objnum"/>-->
                    <!--</xsl:attribute>-->
                    <!--<xsl:apply-templates/>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:when test="@type='work2'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">-->
                        <!--<xsl:value-of select="$basepath"/>/<xsl:value-of select="@type"/>.xq?workid=<xsl:value-of select="@ptr"/>&amp;java=no</xsl:attribute>-->
                    <!--<xsl:apply-templates/>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:when test="@type='simple'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">/blake/<xsl:value-of select="@path"/>?java=no-->
                    <!--</xsl:attribute>-->
                    <!--<xsl:if test="@target">-->
                        <!--<xsl:attribute name="target">-->
                            <!--<xsl:value-of select="@target"/>-->
                        <!--</xsl:attribute>-->
                    <!--</xsl:if>-->
                    <!--<xsl:apply-templates/>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:when test="@type='javastate'">-->
                <!--<a>-->
                    <!--<xsl:attribute name="href">-->
                        <!--<xsl:value-of select="$baseuri"/>?<xsl:for-each select="xalan:tokenize(translate($querystring, '?', ''), '&amp;')">-->
                            <!--<xsl:choose>-->
                                <!--<xsl:when test="contains(., 'java')"/>-->
                                <!--<xsl:otherwise>-->
                                    <!--<xsl:value-of select="."/>&amp;</xsl:otherwise>-->
                            <!--</xsl:choose>-->
                        <!--</xsl:for-each>-->
                        <!--<xsl:choose>-->
                            <!--<xsl:when test="$java='yes'">java=no</xsl:when>-->
                            <!--<xsl:otherwise>java=no</xsl:otherwise>-->
                        <!--</xsl:choose>-->
                    <!--</xsl:attribute>-->
                    <!--<xsl:choose>-->
                        <!--<xsl:when test="$java='no'">-->
                            <!--<img>-->
                                <!--<xsl:attribute name="src">/blake/dwicons/java_bb515.jpg</xsl:attribute>-->
                                <!--<xsl:attribute name="alt">[Java]</xsl:attribute>-->
                            <!--</img>-->
                        <!--</xsl:when>-->
                        <!--<xsl:when test="$java='yes'">-->
                            <!--<img>-->
                                <!--<xsl:attribute name="src">/blake/dwicons/nonjava_bb515.jpg</xsl:attribute>-->
                                <!--<xsl:attribute name="alt">[Non-Java]</xsl:attribute>-->
                            <!--</img>-->
                        <!--</xsl:when>-->
                        <!--<xsl:otherwise>-->
                            <!--<img>-->
                                <!--<xsl:attribute name="src">/blake/dwicons/nonjava_bb515.jpg</xsl:attribute>-->
                                <!--<xsl:attribute name="alt">[Non-Java]</xsl:attribute>-->
                            <!--</img>-->
                        <!--</xsl:otherwise>-->
                    <!--</xsl:choose>-->
                <!--</a>-->
            <!--</xsl:when>-->
            <!--<xsl:otherwise>-->
<!--</xsl:otherwise>-->
        <!--</xsl:choose>-->
    <!--</xsl:template>-->


<!--retrieves predetermined label from label file -->
    <xsl:template name="getlabel">
        <xsl:param name="element"/>
        <xsl:for-each select="$labelfile">
            <xsl:choose>
                <xsl:when test="$element='repositoryid'">
                    <br/>
                    <xsl:value-of select="key('label',$element)"/>:
				</xsl:when>
                <xsl:when test="$element='department'">
                    <xsl:value-of select="key('label',$element)"/>:
				</xsl:when>
                <xsl:when test="$element='collection'">
                    <br/>
                    <xsl:value-of select="key('label',$element)"/>: 	
				</xsl:when>
                <xsl:when test="key('label',$element)">
                    <br style="padding-top:3px"/>
                    <b>
                        <xsl:value-of select="key('label',$element)"/>
                    </b>:
				</xsl:when>
                <xsl:otherwise/>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>
	<!-- provides directional previous and next -->
    <xsl:template match="directional">
        <xsl:variable name="context">
            <xsl:value-of select="@context"/>
        </xsl:variable>
        <xsl:for-each select="items//object">
            <xsl:if test="@id = ../@current">
                <xsl:choose>
                    <xsl:when test="position() = 1">
                        <xsl:choose>
							<!-- when single object -->
                            <xsl:when test="position() = last()">
                                <table width="90%" border="1" align="center">
                                    <tr>
                                        <td width="45%" align="center" class="padding10">Previous</td>
                                        <td width="45%" align="center" class="padding10">Next</td>
                                    </tr>
                                </table>
                            </xsl:when>
                            <xsl:otherwise>
                                <table width="90%" border="1" align="center">
                                    <tr>
                                        <td width="45%" align="center" class="padding10">Previous</td>
                                        <td width="45%" align="center" class="padding10">
										<!--	<xsl:when test="$vg = ''"> -->
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="following-sibling::object/@id"/>
                                                    <xsl:text>&amp;java=no</xsl:text>
                                                    <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                                    </xsl:if>
                                                    <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                                    </xsl:if>
                                                    <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                                    </xsl:if>
                                                    <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                                    </xsl:if>
                                                    <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                                    </xsl:if>
                                                    <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                                    </xsl:if>
                                                </xsl:attribute>Next</a>
                                        </td>
                                    </tr>
                                </table>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:when test="position() = last()">
                        <table width="90%" border="1" align="center">
                            <tr>
                                <td width="45%" align="center" class="padding10">
                                    <a>
                                        <xsl:attribute name="href">
                                            <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="preceding-sibling::object[1]/@id"/>
                                            <xsl:text>&amp;java=no</xsl:text>
                                            <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                            </xsl:if>
                                            <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                            </xsl:if>
                                            <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                            </xsl:if>
                                            <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                            </xsl:if>
                                            <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                            </xsl:if>
                                            <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                            </xsl:if>
                                        </xsl:attribute>
Previous</a>
                                </td>
                                <td width="45%" align="center" class="padding10">Next</td>
                            </tr>
                        </table>
                    </xsl:when>
                    <xsl:otherwise>
                        <table width="90%" border="1" align="center">
                            <tr>
                                <td width="45%" align="center" class="padding10">
                                    <a>
                                        <xsl:attribute name="href">
                                            <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="preceding-sibling::object[1]/@id"/>
                                            <xsl:text>&amp;java=no</xsl:text>
                                            <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                            </xsl:if>
                                            <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                            </xsl:if>
                                            <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                            </xsl:if>
                                            <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                            </xsl:if>
                                            <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                            </xsl:if>
                                            <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                            </xsl:if>
                                        </xsl:attribute>Previous</a>
                                </td>
                                <td width="45%" align="center" class="padding10">
                                    <a>
                                        <xsl:attribute name="href">
                                            <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="following-sibling::object/@id"/>
                                            <xsl:text>&amp;java=no</xsl:text>
                                            <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                            </xsl:if>
                                            <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                            </xsl:if>
                                            <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                            </xsl:if>
                                            <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                            </xsl:if>
                                            <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                            </xsl:if>
                                            <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                            </xsl:if>
                                        </xsl:attribute>Next</a>
                                </td>
                            </tr>
                        </table>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
        </xsl:for-each>
        <br/>
    </xsl:template>
    <xsl:template match="directionalnew">
        <xsl:variable name="context">
            <xsl:value-of select="@context"/>
        </xsl:variable>
        <xsl:for-each select="items/object">
            <xsl:if test="@id = ../@current">
                <xsl:choose>
                    <xsl:when test="position() = 1">
                        <xsl:choose>
                                                        <!-- when single object -->
                            <xsl:when test="position() = last()">
                                <li class="previous_object">Previous</li>
                                <li class="next_object">Next</li>
                            </xsl:when>
                            <xsl:otherwise>
                                <li class="previous_object">Previous</li>
                                <li class="next_object">
                                                                                <!--    <xsl:when test="$vg = ''"> -->
                                    <a>
                                        <xsl:attribute name="href">
                                            <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="following-sibling::object/@id"/>
                                            <xsl:text>&amp;java=no</xsl:text>
                                            <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                            </xsl:if>
                                            <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                                <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                                </xsl:if>
                                                <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                                </xsl:if>
                                                <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                                </xsl:if>
                                            </xsl:if>
                                        </xsl:attribute>Next</a>
                                </li>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:when test="position() = last()">
                        <li class="previous_object">
                            <a>
                                <xsl:attribute name="href">
                                    <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="preceding-sibling::object[1]/@id"/>
                                    <xsl:text>&amp;java=no</xsl:text>
                                    <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                    </xsl:if>
                                    <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                    </xsl:if>
                                    <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                    </xsl:if>
                                    <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                    </xsl:if>
                                    <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                    </xsl:if>
                                    <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                    </xsl:if>
                                </xsl:attribute>
Previous</a>
                        </li>
                        <li class="next_object">Next</li>
                    </xsl:when>
                    <xsl:otherwise>
                        <li class="previous_object">
                            <a>
                                <xsl:attribute name="href">
                                    <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="preceding-sibling::object[1]/@id"/>
                                    <xsl:text>&amp;java=no</xsl:text>
                                    <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                    </xsl:if>
                                    <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                    </xsl:if>
                                    <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                    </xsl:if>
                                    <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                    </xsl:if>
                                </xsl:attribute>Previous</a>
                        </li>
                        <li class="next_object">
                            <a>
                                <xsl:attribute name="href">
                                    <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="following-sibling::object/@id"/>
                                    <xsl:text>&amp;java=no</xsl:text>
                                    <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                    </xsl:if>
                                    <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                    </xsl:if>
                                    <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                    </xsl:if>
                                    <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                    </xsl:if>
                                    <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                    </xsl:if>
                                    <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                    </xsl:if>
                                </xsl:attribute>Next</a>
                        </li>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
        </xsl:for-each>
        <br/>
    </xsl:template>


	<!--arrows -->
    <xsl:template match="arrow">
        <xsl:variable name="context">
            <xsl:value-of select="@context"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="@direction='next'">
                <xsl:for-each select="items/object">
                    <xsl:if test="@id = ../@current">
                        <xsl:choose>
                            <xsl:when test="position() = last()">
                                <img>
                                    <xsl:attribute name="src">/blake/dwicons/d_next.gif</xsl:attribute>
                                    <xsl:attribute name="alt"> No Next</xsl:attribute>
                                    <xsl:attribute name="border">Next</xsl:attribute>
                                </img>
                            </xsl:when>
                            <xsl:otherwise>
                                <a>
                                    <xsl:attribute name="href">
                                        <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="following-sibling::object/@id"/>
                                        <xsl:text>&amp;java=no</xsl:text>
                                        <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                        </xsl:if>
                                        <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                        </xsl:if>
                                        <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                        </xsl:if>
                                        <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                        </xsl:if>
                                        <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                        </xsl:if>
                                        <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                        </xsl:if>
                                    </xsl:attribute>
                                    <img>
                                        <xsl:attribute name="src">/blake/dwicons/b_next.gif</xsl:attribute>
                                        <xsl:attribute name="alt">Next</xsl:attribute>
                                        <xsl:attribute name="border">Next</xsl:attribute>
                                    </img>
                                </a>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:if>
                </xsl:for-each>
            </xsl:when>
            <xsl:when test="@direction='previous'">
                <xsl:for-each select="items/object">
                    <xsl:if test="@id = ../@current">
                        <xsl:choose>
                            <xsl:when test="position() = 1">
                                <img>
                                    <xsl:attribute name="src">/blake/dwicons/d_prev.gif</xsl:attribute>
                                    <xsl:attribute name="alt"> No Previous</xsl:attribute>
                                    <xsl:attribute name="border">Previous</xsl:attribute>
                                </img>
                            </xsl:when>
                            <xsl:otherwise>
                                <a>
                                    <xsl:attribute name="href">
                                        <xsl:value-of select="$blakeroot"/>archive/<xsl:value-of select="$context"/>.xq?objectid=<xsl:value-of select="preceding-sibling::object[1]/@id"/>
                                        <xsl:text>&amp;java=no</xsl:text>
                                        <xsl:if test="$vg">&amp;vg=<xsl:value-of select="$vg"/>
                                        </xsl:if>
                                        <xsl:if test="$vcontext">&amp;vcontext=<xsl:value-of select="$vcontext"/>
                                        </xsl:if>
                                        <xsl:if test="$titles">&amp;titles=<xsl:value-of select="$titles"/>
                                        </xsl:if>
                                        <xsl:if test="$landing">&amp;landing=<xsl:value-of select="$landing"/>
                                        </xsl:if>
                                        <xsl:if test="$mode">&amp;mode=<xsl:value-of select="$mode"/>
                                        </xsl:if>
                                        <xsl:if test="$term">&amp;mode=<xsl:value-of select="$term"/>
                                        </xsl:if>
                                    </xsl:attribute>
                                    <img>
                                        <xsl:attribute name="src">/blake/dwicons/b_prev.gif</xsl:attribute>
                                        <xsl:attribute name="alt">Previous</xsl:attribute>
                                        <xsl:attribute name="border">Previous</xsl:attribute>
                                    </img>
                                </a>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:if>
                </xsl:for-each>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="b">
        <b>
            <xsl:apply-templates/>
        </b>
    </xsl:template>
    <xsl:template match="hr">
        <xsl:copy-of select="."/>
    </xsl:template>
    <xsl:template match="img">
        <xsl:copy-of select="."/>
    </xsl:template>
    <xsl:template match="a">
        <xsl:copy-of select="."/>
    </xsl:template>
    <xsl:template match="exist:match">
        <xsl:choose>
            <xsl:when test="ancestor::illusdesc">
                <xsl:choose>
                    <xsl:when test="parent::characteristic">
                        <span style="color:red">
                            <xsl:apply-templates/>
                        </span>
                    </xsl:when>
                    <xsl:when test="ancestor::document[@type='image']">
                        <xsl:apply-templates/>
                    </xsl:when>
                    <xsl:otherwise>
                        <span style="color:red">
                            <xsl:apply-templates/>
                        </span>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <span style="color:red">
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="wrap">
        <xsl:apply-templates/>
    </xsl:template>
</xsl:stylesheet><!-- Stylus Studio meta-information - (c)1998-2004. Sonic Software Corporation. All rights reserved.
<metaInformation>
<scenarios/><MapperMetaTag><MapperInfo srcSchemaPathIsRelative="yes" srcSchemaInterpretAsXML="no" destSchemaPath="" destSchemaRoot="" destSchemaPathIsRelative="yes" destSchemaInterpretAsXML="no"/><MapperBlockPosition></MapperBlockPosition></MapperMetaTag>




</metaInformation>
-->
